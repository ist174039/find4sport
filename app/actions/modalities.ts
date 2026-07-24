'use server'

export async function suggestModalityAction(modalityName: string) {
  // Simulate an API call / saving to a database table "modality_suggestions"
  // For now, we'll just log it and simulate network delay
  console.log('Received modality suggestion:', modalityName)
  await new Promise(r => setTimeout(r, 800))
  return { success: true }
}
