-- Create Menu Table
CREATE TABLE menu (
  day_of_week INT,
  menu_type VARCHAR(10) NOT NULL,
  item_1 VARCHAR(100),
  item_2 VARCHAR(100),
  item_3 VARCHAR(100),
  image_1 TEXT,
  image_2 TEXT,
  image_3 TEXT,
  PRIMARY KEY (day_of_week, menu_type)
);

-- Create Members Table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  monday BOOLEAN DEFAULT FALSE,
  tuesday BOOLEAN DEFAULT FALSE,
  wednesday BOOLEAN DEFAULT FALSE,
  thursday BOOLEAN DEFAULT FALSE,
  friday BOOLEAN DEFAULT FALSE,
  saturday BOOLEAN DEFAULT FALSE
);

-- Create History Table
CREATE TABLE history (
  id SERIAL PRIMARY KEY, 
  member_id INT REFERENCES members(id),
  date DATE NOT NULL,
  breakfast VARCHAR(100),
  lunch VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
