type AuditClient = {
  from: (table: string) => {
    insert: (value: Record<string, unknown> | Record<string, unknown>[]) => PromiseLike<unknown>
  }
}

export async function writeAdminAudit(
  client: AuditClient,
  input: {
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    tableName: string
    userEmail: string
    message: string
    data?: Record<string, unknown>
  }
) {
  try {
    await client.from('audit_logs').insert({
      action: input.action,
      table_name: input.tableName,
      user_email: input.userEmail,
      new_data: {
        action: input.message,
        ...(input.data || {}),
      },
    })
  } catch (error) {
    console.error('Failed to write admin audit log', error)
  }
}
