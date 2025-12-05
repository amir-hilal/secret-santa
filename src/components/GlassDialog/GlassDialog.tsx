import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material';

// Dialog type definitions
export type DialogType =
  | 'delete-room'
  | 'edit-room'
  | 'reset-room'
  | 'confirm-identity'
  | 'custom';

interface BaseDialogData {
  type: DialogType;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DeleteRoomData extends BaseDialogData {
  type: 'delete-room';
  roomName: string;
}

interface EditRoomData extends BaseDialogData {
  type: 'edit-room';
  roomName: string;
  participants: string;
  onRoomNameChange: (name: string) => void;
  onParticipantsChange: (participants: string) => void;
}

interface ResetRoomData extends BaseDialogData {
  type: 'reset-room';
  roomName: string;
}

interface ConfirmIdentityData extends BaseDialogData {
  type: 'confirm-identity';
  name: string;
}

interface CustomData extends BaseDialogData {
  type: 'custom';
  children: React.ReactNode;
}

export type DialogData =
  | DeleteRoomData
  | EditRoomData
  | ResetRoomData
  | ConfirmIdentityData
  | CustomData;

interface GlassDialogProps extends Omit<DialogProps, 'slotProps'> {
  dialogData?: DialogData;
}

/**
 * GlassDialog - A reusable dialog component with glass morphism effect
 */
export default function GlassDialog({ dialogData, ...props }: GlassDialogProps) {
  const renderContent = () => {
    if (!dialogData) return null;

    switch (dialogData.type) {
      case 'delete-room':
        return (
          <>
            <DialogTitle
              sx={{
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-xl)',
              }}
            >
              Delete Room?
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}
              >
                Are you sure you want to delete the room{' '}
                <strong>"{dialogData.roomName}"</strong>? This action cannot be undone and
                all participant data will be lost.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
              <Button
                onClick={dialogData.onCancel}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderColor: 'var(--text-gray)',
                  color: 'var(--text-gray)',
                  '&:hover': {
                    borderColor: 'var(--text-primary)',
                    backgroundColor: 'var(--overlay-light)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={dialogData.onConfirm}
                variant="contained"
                color="error"
                sx={{ textTransform: 'none', fontWeight: 'var(--font-weight-semibold)' }}
                autoFocus
              >
                Delete Room
              </Button>
            </DialogActions>
          </>
        );

      case 'edit-room':
        return (
          <>
            <DialogTitle
              sx={{
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-xl)',
              }}
            >
              Edit Room
            </DialogTitle>
            <DialogContent>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  <label
                    htmlFor="edit-room-name"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    Room Name:
                  </label>
                  <input
                    type="text"
                    id="edit-room-name"
                    value={dialogData.roomName}
                    onChange={(e) => dialogData.onRoomNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: 'var(--font-size-base)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-participants"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    Participants (one per line):
                  </label>
                  <textarea
                    id="edit-participants"
                    value={dialogData.participants}
                    onChange={(e) => dialogData.onParticipantsChange(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: 'var(--font-size-base)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--overlay-light)',
                    borderRadius: '8px',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <strong>⚠️ Warning:</strong> Updating participants will clear all
                  existing assignments. Participants will need to pick their Secret Santa
                  again.
                </div>
              </div>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
              <Button
                onClick={dialogData.onCancel}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderColor: 'var(--text-gray)',
                  color: 'var(--text-gray)',
                  '&:hover': {
                    borderColor: 'var(--text-primary)',
                    backgroundColor: 'var(--overlay-light)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={dialogData.onConfirm}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  backgroundColor: 'var(--primary-color)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-hover)',
                  },
                }}
                autoFocus
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        );

      case 'reset-room':
        return (
          <>
            <DialogTitle
              sx={{
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-xl)',
              }}
            >
              Reset Room Assignments?
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}
              >
                Are you sure you want to reset all assignments in{' '}
                <strong>"{dialogData.roomName}"</strong>? This will clear all Secret Santa
                picks and participants will need to pick again. Participants will remain
                unchanged.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
              <Button
                onClick={dialogData.onCancel}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderColor: 'var(--text-gray)',
                  color: 'var(--text-gray)',
                  '&:hover': {
                    borderColor: 'var(--text-primary)',
                    backgroundColor: 'var(--overlay-light)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={dialogData.onConfirm}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  backgroundColor: 'var(--warning-color)',
                  '&:hover': {
                    backgroundColor: 'var(--warning-hover)',
                  },
                }}
                autoFocus
              >
                Reset Assignments
              </Button>
            </DialogActions>
          </>
        );

      case 'confirm-identity':
        return (
          <>
            <DialogTitle
              sx={{
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--text-primary)',
              }}
            >
              Confirm Identity
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: 'var(--font-size-base)', color: 'var(--text-gray)' }}
              >
                Is that really you <strong>{dialogData.name}</strong>? Don't ruin it!
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
              <Button
                onClick={dialogData.onCancel}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderColor: 'var(--text-gray)',
                  color: 'var(--text-gray)',
                  '&:hover': {
                    borderColor: 'var(--text-primary)',
                    backgroundColor: 'var(--overlay-light)',
                  },
                }}
              >
                no, sorry :(
              </Button>
              <Button
                onClick={dialogData.onConfirm}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  backgroundColor: 'var(--primary-color)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-hover)',
                  },
                }}
                autoFocus
              >
                YES!
              </Button>
            </DialogActions>
          </>
        );

      case 'custom':
        return dialogData.children;

      default:
        return null;
    }
  };

  return (
    <Dialog
      {...props}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            padding: 1,
            background: 'var(--card-background)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)',
          },
        },
      }}
    >
      {renderContent()}
    </Dialog>
  );
}
