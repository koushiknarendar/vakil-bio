create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyers(id) on delete cascade,
  type text not null check (type in ('booking', 'lead', 'verification_approved', 'verification_rejected')),
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_lawyer_id_idx on notifications(lawyer_id);
create index if not exists notifications_read_idx on notifications(lawyer_id, read);

alter table notifications enable row level security;

create policy "lawyers read own notifications"
  on notifications for select
  using (lawyer_id = (select id from lawyers where user_id = auth.uid()));

create policy "service role insert notifications"
  on notifications for insert
  with check (true);

create policy "lawyers update own notifications"
  on notifications for update
  using (lawyer_id = (select id from lawyers where user_id = auth.uid()));
