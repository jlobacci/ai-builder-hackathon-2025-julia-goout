-- Drop existing view first
DROP VIEW IF EXISTS v_people_threads;

-- Create view for person-based message threads
CREATE OR REPLACE VIEW v_people_threads AS
WITH user_conversations AS (
  -- Get all unique person-to-person conversations through shared invites
  SELECT DISTINCT
    CASE 
      WHEN m.sender_id = auth.uid() THEN (
        -- If I'm the sender, get the other participants
        SELECT DISTINCT m2.sender_id 
        FROM messages m2 
        WHERE m2.invite_id = m.invite_id 
          AND m2.sender_id != auth.uid()
        LIMIT 1
      )
      ELSE m.sender_id
    END as person_id,
    m.invite_id
  FROM messages m
  WHERE m.invite_id IN (
    -- Invites where I'm the author
    SELECT id FROM invites WHERE author_id = auth.uid()
    UNION
    -- Invites where I'm an applicant
    SELECT invite_id FROM applications WHERE applicant_id = auth.uid()
  )
  AND (
    m.sender_id = auth.uid() 
    OR m.sender_id IN (
      SELECT DISTINCT sender_id 
      FROM messages 
      WHERE invite_id = m.invite_id 
        AND sender_id != auth.uid()
    )
  )
),
latest_message_per_person AS (
  SELECT 
    uc.person_id,
    MAX(m.created_at) as last_message_at,
    (
      SELECT m2.id 
      FROM messages m2 
      WHERE m2.invite_id IN (
        SELECT invite_id FROM user_conversations WHERE person_id = uc.person_id
      )
      ORDER BY m2.created_at DESC 
      LIMIT 1
    ) as last_message_id
  FROM user_conversations uc
  JOIN messages m ON m.invite_id = uc.invite_id
  GROUP BY uc.person_id
)
SELECT 
  lmp.person_id,
  p.display_name as person_name,
  p.avatar_url as person_avatar,
  lmp.last_message_at,
  lm.body as last_message_body,
  lm.sender_id as last_message_sender_id,
  (
    -- Get the most recent invite_id for this person
    SELECT m.invite_id 
    FROM messages m
    JOIN user_conversations uc ON uc.invite_id = m.invite_id AND uc.person_id = lmp.person_id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_invite_id
FROM latest_message_per_person lmp
JOIN profiles p ON p.user_id = lmp.person_id
LEFT JOIN messages lm ON lm.id = lmp.last_message_id
WHERE lmp.person_id IS NOT NULL
ORDER BY lmp.last_message_at DESC;