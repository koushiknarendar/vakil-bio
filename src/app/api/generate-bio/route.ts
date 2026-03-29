import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const client = new OpenAI()

export async function POST(request: NextRequest) {
  const { fullName, title, yearsExp, location, practiceAreas, languages, currentFirm, university } =
    await request.json()

  const details = [
    fullName && `Name: ${fullName}`,
    title && `Designation: ${title}`,
    yearsExp && `Years of experience: ${yearsExp}`,
    location && `Based in: ${location}`,
    practiceAreas?.length && `Practice areas: ${practiceAreas.join(', ')}`,
    languages?.length && `Languages: ${languages.join(', ')}`,
    currentFirm && `Current firm: ${currentFirm}`,
    university && `Educated at: ${university}`,
  ]
    .filter(Boolean)
    .join('\n')

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Write a concise, professional 2–3 sentence bio for an Indian advocate to appear on their vakil.bio profile. It should build client trust, mention key practice areas, and sound warm yet authoritative. Do NOT use the word "monetize", "client acquisition", or any solicitation language (Bar Council of India compliance). Write in third person. Do not include any introductory text, just the bio itself.

Advocate details:
${details}`,
      },
    ],
  })

  const bio = completion.choices[0]?.message?.content ?? ''
  return NextResponse.json({ bio })
}
