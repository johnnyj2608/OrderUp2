CREATE OR REPLACE FUNCTION set_b_received_to_false()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.breakfast IS NULL AND NEW.breakfast IS NOT NULL THEN
        NEW.b_received := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_b_received_to_false
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_b_received_to_false();

CREATE OR REPLACE FUNCTION set_l_received_to_false()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.lunch IS NULL AND NEW.lunch IS NOT NULL THEN
        NEW.l_received := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_l_received_to_false
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_l_received_to_false();
