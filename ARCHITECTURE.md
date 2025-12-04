# Secret Santa App - Technical Architecture

## 🏗️ Architecture Overview

This app uses a **serverless, real-time architecture** with Firebase Realtime Database as the single source of truth.

```
┌─────────────────┐
│   React App     │ (Multiple devices simultaneously)
│   (Frontend)    │
└────────┬────────┘
         │ Firebase SDK v9
         │ (WebSocket connection)
         ▼
┌─────────────────┐
│    Firebase     │
│ Realtime DB     │ (Single source of truth)
└─────────────────┘
```

---

## 🔄 Data Flow

### 1. Room Creation (Organizer)

```
User enters names → createRoom() → Firebase /rooms/{roomId}
                                          ├─ participants/
                                          ├─ availableTargets/
                                          └─ status: "open"
```

### 2. Participant Identification

```
Device opens room → Check localStorage → Has participant ID?
                                         ├─ Yes → Auto-login
                                         └─ No  → Show name input
                                                  ↓
                                         Match name (case-insensitive)
                                                  ↓
                                         Save to localStorage
```

### 3. Secret Santa Assignment (CRITICAL)

```
User clicks "Pick" → assignSecretSanta()
                     ↓
            Firebase TRANSACTION
                     ├─ Read current room state
                     ├─ Filter valid targets:
                     │  - availableTargets[id] === true
                     │  - id !== participantId (no self-pick)
                     ├─ Random selection
                     ├─ Write assignment
                     ├─ Mark target unavailable
                     └─ Update status if all done
                     ↓
            Update localStorage with target name
                     ↓
            Real-time update → All devices see new count
```

---

## 🔐 Race Condition Safety (The Key Feature)

### The Problem

Two users (Alice and Bob) click "Pick" at the **exact same time**. Without proper handling:

- Both might read the same available targets
- Both might pick Charlie
- **Result: Duplicate assignment** ❌

### The Solution: Firebase Transactions

**Transaction guarantees:**

1. **Atomic read-modify-write**: No one can read stale data
2. **Automatic retry**: If conflict detected, transaction re-runs
3. **Serialization**: Concurrent operations are ordered

**How it works:**

```typescript
// Inside assignSecretSanta() in roomsService.ts
await runTransaction(roomRef, (currentRoom) => {
  // 1. Read current state (this is LOCKED during transaction)
  const availableTargets = currentRoom.availableTargets;

  // 2. Filter valid targets
  const validTargetIds = Object.keys(availableTargets).filter(
    (targetId) => availableTargets[targetId] === true &&
                  targetId !== participantId
  );

  // 3. Random pick
  const selectedTargetId = validTargetIds[randomIndex];

  // 4. Modify and return (Firebase commits this atomically)
  updatedRoom.assignments[participantId] = { targetId: selectedTargetId, ... };
  updatedRoom.availableTargets[selectedTargetId] = false;

  return updatedRoom; // ✅ Atomic commit
});
```

**Scenario with Alice and Bob:**

```
Time    Alice's Device              Firebase              Bob's Device
────────────────────────────────────────────────────────────────────────
T1      Click "Pick" ──────────────▶ Start Transaction
T2                                   Lock room data
T3                                   Alice reads:
                                     [Charlie, Diana, Evan]
T4                                                     ◀──── Click "Pick"
T5                                   Alice picks: Charlie   (Bob waits...)
T6                                   Write + Unlock
T7      Show "Charlie" ◀─────────────┘                      Start Transaction
T8                                                           Lock room data
T9                                                           Bob reads:
                                                             [Diana, Evan]
T10                                                          (Charlie gone!)
T11                                                          Bob picks: Diana
T12                                ◀──────────────────────── Write + Unlock
T13                                                     ─▶   Show "Diana"
```

✅ **No duplicate picks!** Firebase transaction serialized the operations.

---

## 💾 Data Model

### Firebase Realtime Database Structure

```json
{
  "rooms": {
    "abc123xyz": {
      "createdAt": 1701734400000,
      "status": "open",

      "participants": {
        "p1_1701734400001": {
          "id": "p1_1701734400001",
          "name": "Alice"
        },
        "p2_1701734400002": {
          "id": "p2_1701734400002",
          "name": "Bob"
        },
        "p3_1701734400003": {
          "id": "p3_1701734400003",
          "name": "Charlie"
        }
      },

      "assignments": {
        "p1_1701734400001": {
          "participantId": "p1_1701734400001",
          "targetId": "p3_1701734400003",
          "assignedAt": 1701734450000
        }
      },

      "availableTargets": {
        "p1_1701734400001": true,
        "p2_1701734400002": true,
        "p3_1701734400003": false // Charlie was picked
      }
    }
  }
}
```

### localStorage Structure

```json
{
  "secretSanta_abc123xyz": {
    "participantId": "p1_1701734400001",
    "name": "Alice",
    "targetName": "Charlie"
  }
}
```

**Why localStorage?**

- Remembers the user on the same device
- Faster UX (no need to re-enter name)
- Works offline for returning users
- Device-specific (intentional - different devices = different people)

---

## 🎯 Component Architecture

### Page Components

```
App.tsx (Router)
├─ HomePage.tsx (/)
│  └─ Create room form
│     └─ createRoom() → Navigate to /room/{id}
│
├─ RoomPage.tsx (/room/:roomId)
│  ├─ useRoom() hook → Real-time subscription
│  ├─ Identity check (localStorage)
│  ├─ Name input (first visit)
│  └─ Pick button → assignSecretSanta()
│
└─ NotFoundPage.tsx (*)
   └─ 404 page
```

### Custom Hooks

**useRoom(roomId)**

```typescript
// Real-time subscription to room data
const { room, loading, error } = useRoom(roomId);

// Automatically:
// - Subscribes on mount
// - Updates on any change
// - Unsubscribes on unmount
```

### Service Layer

**roomsService.ts**

- `createRoom(names)` - Initialize room in DB
- `getRoom(roomId)` - One-time read
- `subscribeToRoom(roomId, callback)` - Real-time listener
- `assignSecretSanta(roomId, participantId)` - **Transaction-based assignment**
- `findParticipantIdByName(room, name)` - Helper for name matching

---

## 🔒 Security Model

### Current Rules (Development)

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true, // Anyone can read
        ".write": "!data.exists()" // Can only create new rooms
      }
    }
  }
}
```

### Production Improvements Needed

1. **Authentication**

   ```json
   ".write": "auth != null && !data.exists()"
   ```

2. **Validate assignments**

   ```json
   "assignments": {
     "$participantId": {
       ".validate": "
         newData.child('targetId').val() != $participantId &&
         root.child('rooms').child($roomId).child('participants')
              .hasChild(newData.child('targetId').val())
       "
     }
   }
   ```

3. **Rate limiting** (requires Cloud Functions)
   - Max X rooms per user per day
   - Max Y picks per room per minute

4. **Room expiration** (requires Cloud Functions)
   - Auto-delete rooms older than 30 days
   - Archive completed rooms

---

## 🚀 Performance Considerations

### Real-time Subscriptions

- **Efficient**: WebSocket connection (not polling)
- **Scoped**: Only subscribe to the specific room
- **Cleanup**: Unsubscribe on component unmount

### Bundle Size

- Firebase SDK: ~150KB (gzipped)
- React + Router: ~40KB (gzipped)
- App code: ~15KB (gzipped)
- **Total: ~205KB** - loads in <1s on 3G

### Database Reads/Writes

**Per room creation:**

- 1 write

**Per participant:**

- 1 read on join (via subscription)
- Real-time updates (no additional reads)
- 1 write on assignment

**For 15 participants:**

- 1 + 15 = **16 writes**
- 15 subscriptions = **minimal reads** (WebSocket)

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Room Creation:**

- ✅ Create room with 2+ participants
- ✅ Create room with duplicate names (should error)
- ✅ Create room with empty lines (should filter)

**Identity:**

- ✅ Enter correct name (case-insensitive)
- ✅ Enter wrong name (should error)
- ✅ Revisit on same device (should auto-login)

**Assignment:**

- ✅ Pick Secret Santa successfully
- ✅ Try to pick twice (should show previous pick)
- ✅ Last person can still pick
- ✅ Cannot pick yourself

**Race Conditions (Multi-device):**

- ✅ Two people pick simultaneously (no duplicates)
- ✅ Three people pick simultaneously (all different)
- ✅ Real-time updates visible on all devices

---

## 🔧 Debugging Tips

### Check Firebase Console

1. Go to Firebase Console → Realtime Database
2. View your room data structure
3. Verify assignments and availableTargets

### Browser DevTools

```javascript
// Check localStorage
localStorage.getItem('secretSanta_ROOM_ID');

// Clear localStorage (for testing)
localStorage.clear();
```

### Network Tab

- Look for WebSocket connection to Firebase
- Check for 401 errors (security rules issue)
- Verify transaction requests complete

---

## 📈 Scaling Considerations

**Current capacity:**

- ✅ 100+ concurrent rooms: No problem
- ✅ 50 participants per room: Works fine
- ⚠️ 1000+ concurrent rooms: May need Firebase Blaze plan

**Bottlenecks:**

- Firebase free tier: 100 simultaneous connections
- Realtime DB: 200,000 concurrent connections (paid)

**Improvements for scale:**

- Add room expiration (reduce data)
- Implement cleanup Cloud Functions
- Use Firebase Analytics for monitoring

---

## 🎨 UI/UX Design Decisions

1. **No login required** - Friction-free for casual use
2. **Name-based identity** - Simple, familiar
3. **localStorage persistence** - Seamless return experience
4. **Real-time stats** - Builds excitement, shows progress
5. **Mobile-first** - Most users will be on phones
6. **Single room concept** - Keeps complexity low

---

## 🔄 Future Enhancements

- [ ] Admin panel to see all assignments (for troubleshooting)
- [ ] Email notifications when all picks are done
- [ ] Gift budget constraints
- [ ] Exclusion rules (e.g., couples can't pick each other)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Room password protection
- [ ] Analytics dashboard

---

This architecture prioritizes:

1. ✅ **Correctness** (transactions prevent duplicates)
2. ✅ **Simplicity** (no backend needed)
3. ✅ **Real-time UX** (Firebase WebSocket)
4. ✅ **Mobile-friendly** (responsive design)
5. ✅ **Easy deployment** (Firebase Hosting)
