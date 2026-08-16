create index if not exists messages_thread_id_idx on public.messages(thread_id) where thread_id is not null;
create index if not exists reservations_user_id_idx on public.reservations(user_id);
create index if not exists event_participants_ticket_type_id_idx on public.event_participants(ticket_type_id) where ticket_type_id is not null;
create index if not exists event_ticket_types_event_id_idx on public.event_ticket_types(event_id);
create index if not exists sport_spaces_owner_user_id_idx on public.sport_spaces(owner_user_id) where owner_user_id is not null;
create index if not exists transactions_related_transaction_id_idx on public.transactions(related_transaction_id) where related_transaction_id is not null;
create index if not exists community_categories_category_id_idx on public.community_categories(category_id);
create index if not exists reservation_change_requests_requested_by_idx on public.reservation_change_requests(requested_by) where requested_by is not null;
create index if not exists reservation_change_requests_reviewer_id_idx on public.reservation_change_requests(reviewer_id) where reviewer_id is not null;
