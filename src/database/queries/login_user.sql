create or replace function login_user(email_input text)
returns table (
  uid int,
  email text,
  password_hash text,
  name text
)
language sql
as $$
  select uid, email, password_hash, name
  from users
  where email = email_input;
$$;
