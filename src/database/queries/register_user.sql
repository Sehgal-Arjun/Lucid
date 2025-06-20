create or replace function register_user(
  email_input text,
  password_hash_input text,
  name_input text
)
returns table (
  uid int,
  email text,
  name text
)
language sql
as $$
  insert into users (email, password_hash, name)
  values (email_input, password_hash_input, name_input)
  returning uid, email, name;
$$;
