/*
  # Create user details table

  1. New Tables
    - `user_details`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `created_at` (timestamp)
      - `last_sign_in` (timestamp)

  2. Security
    - Enable RLS on `user_details` table
    - Add policies for authenticated users to:
      - Read their own data
      - Insert their own data
      - Update their own data
*/

CREATE TABLE IF NOT EXISTS user_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_sign_in timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data"
  ON user_details
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own data
CREATE POLICY "Users can insert own data"
  ON user_details
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update own data"
  ON user_details
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);