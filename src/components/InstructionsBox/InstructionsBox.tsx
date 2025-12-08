import './InstructionsBox.css';

/**
 * InstructionsBox - Displays instructions for creating a Secret Santa room
 */
export default function InstructionsBox() {
  return (
    <div className="info-box">
      <h3>Instructions:</h3>
      <ol>
        <li>Enter participant names (one per line)</li>
        <li>Click "Create room"</li>
        <li>Copy and share the room link</li>
      </ol>
    </div>
  );
}
