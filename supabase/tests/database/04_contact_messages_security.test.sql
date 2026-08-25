-- Test Suite: 04_contact_messages_security.test.sql
-- Description: Verifies contact form write-only submission boundaries and privacy.

begin;
select plan(5);

set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 1. Anon can insert a valid contact message
select lives_ok(
  $$insert into public.contact_messages (name, email, subject, message)
    values ('Inquirer Anon', 'inq@example.invalid', 'Question', 'Sample inquiry text')$$,
  'Anon can insert a contact message'
);

-- 2. Anon cannot insert a contact message with status other than 'new'
select throws_ok(
  $$insert into public.contact_messages (name, email, subject, message, status)
    values ('Inquirer Anon', 'inq@example.invalid', 'Question', 'Sample inquiry text', 'read')$$,
  '42501', -- permission denied
  null,
  'Anon cannot insert contact messages with modified status'
);

-- 3. Anon cannot select contact messages
select throws_ok(
  'select * from public.contact_messages',
  '42501', -- permission denied
  null,
  'Anon cannot select contact messages'
);

-- 4. Anon cannot update contact messages
select throws_ok(
  'update public.contact_messages set status = ''read''',
  '42501', -- permission denied
  null,
  'Anon cannot update contact messages'
);

-- 5. Anon cannot delete contact messages
select throws_ok(
  'delete from public.contact_messages',
  '42501', -- permission denied
  null,
  'Anon cannot delete contact messages'
);

select * from finish();
rollback;
