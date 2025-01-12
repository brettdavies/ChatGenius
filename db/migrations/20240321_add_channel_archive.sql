-- Add archiving support to channels table
ALTER TABLE channels 
  ADD COLUMN archived_at TIMESTAMPTZ,
  ADD COLUMN archived_by VARCHAR(26) REFERENCES users(id);

-- Index for faster queries excluding archived channels
CREATE INDEX idx_channels_archived_at ON channels(archived_at) WHERE archived_at IS NULL;

-- Add trigger to prevent updates to archived channels
CREATE OR REPLACE FUNCTION prevent_archived_channel_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify archived channel';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_archived_channel_updates
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION prevent_archived_channel_updates(); 