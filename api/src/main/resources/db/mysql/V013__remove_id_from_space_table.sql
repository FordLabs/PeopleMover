ALTER TABLE space DROP PRIMARY KEY,
DROP COLUMN id,
ADD PRIMARY KEY (uuid);