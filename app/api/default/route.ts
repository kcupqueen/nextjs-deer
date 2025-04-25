// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

interface FormData {
  daysWithout: number;
  desireIntensity: number;
  hasImportantActivity: boolean;
  age: number;
  spermColor: string;
  anonymousId: string;
  date: string; // Date comes as string from JSON
}

type DayRecords = {
  [key: string]: FormData[];
};

// Declare dayRecords at the module level (outside POST/GET)
// Note: This is in-memory storage and may not persist across serverless function invocations.
const dayRecords: DayRecords = {};

export async function POST(request: Request): Promise<NextResponse> {
  // Add this line for debugging:
  console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Loaded' : 'MISSING!');

  try {
    const formData: FormData = await request.json();

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data provided' }, { status: 400 });
    }

    if (typeof formData.date !== 'string' || isNaN(Date.parse(formData.date))) {
      return NextResponse.json({ error: 'Invalid date format in form data' }, { status: 400 });
    }

    const dateObj = new Date(formData.date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date value in form data' }, { status: 400 });
    }

    const day = dateObj.toISOString().split('T')[0];

    // Use the module-level dayRecords
    if (dayRecords[day]) {
      dayRecords[day].push(formData);
    } else {
      dayRecords[day] = [formData];
    }

    // This logic now operates on the module-level dayRecords
    const lowerKey = Object.keys(dayRecords).sort().find(key => key < day); // Sort keys to reliably find the *immediately* lower key if needed
    if (lowerKey) {
      try {
        console.log(`Found older key ${lowerKey}, saving its data to blob...`);
        const dataToSave = dayRecords[lowerKey];
        const { url } = await put(
          `deer/archived-${lowerKey}.json`, // Changed filename format
          JSON.stringify(dataToSave),
          { access: 'public' }
        );
        console.log(`Saved data for ${lowerKey} to ${url}. Removing from memory.`);
        // clear cache
        delete dayRecords[lowerKey];
      } catch (putError) {
        console.error(`Failed to save data for key ${lowerKey} to blob:`, putError);
        // Decide if you want to proceed without clearing the key or return an error
      }
    }

    return NextResponse.json({
      success: true,
      // message: 'Form data processed.' // Maybe adjust message
    });
  } catch (error) {
    console.error('Error processing POST request:', error); // Changed log message
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Failed to process form data', // Changed error message
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Implement GET to return the module-level dayRecords
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Return a copy to prevent accidental mutation if the object is complex
    // For simple objects like this, direct return is usually fine.
    return NextResponse.json({ success: true, data: dayRecords });
  } catch (error) {
    console.error('Error processing GET request:', error);
    return NextResponse.json({
      error: 'Failed to retrieve records',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}