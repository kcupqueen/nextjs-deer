// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // Add this line for debugging:
  console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Loaded' : 'MISSING!');

  try {
    // Parse the form data from the request
    const formData = await request.json();
    
    // Validate the form data
    if (!formData) {
      return NextResponse.json({ error: 'No form data provided' }, { status: 400 });
    }
    
    // Check if the form data has the expected fields
    const { daysWithout, desireIntensity, hasImportantActivity, age, spermColor } = formData;
    
    // Save the form data to Vercel Blob storage
    const { url } = await put(
      `deer/formdata-${Date.now()}.json`, 
      JSON.stringify(formData), 
      { access: 'public' }
    );
    
    // Return success response with the URL where the data was saved
    return NextResponse.json({ 
      success: true, 
      message: 'Form data saved successfully',
      url,
      data: formData
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    return NextResponse.json({ 
      error: 'Failed to save form data', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}