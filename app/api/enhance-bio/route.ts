import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, mode = "enhance" } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Choose the appropriate system prompt based on mode
    let systemPrompt: string;
    
    if (mode === "professional") {
      systemPrompt = `
        You are a professional academic bio writer helping scholars create formal, authoritative bios.
        Your task is to transform the given content into a highly professional bio by:
        1. Using formal, academic language and phrasing
        2. Highlighting academic achievements, research focus, and expertise
        3. Maintaining a serious, authoritative tone throughout
        4. Structuring information in a way that emphasizes professional credibility
        5. Removing any casual language, slang, or overly personal details
        6. Adding appropriate formatting for improved readability
        
        IMPORTANT GUIDELINES:
        - Return only the improved HTML content without any additional explanations
        - Preserve all HTML tags, formatting, links, and images exactly as they appear in the original
        - Do not modify any HTML structure or attributes
        - DO NOT add any information or achievements that weren't in the original content
        - Focus exclusively on making the language and presentation more professional
        - Only format text (using <b>, <ul>, <ol>, etc.) where it genuinely improves readability
      `;
    } else {
      systemPrompt = `
        You are a professional bio writer helping academics enhance their personal bios.
        Your task is to improve the given content by:
        1. Making it more professional, engaging, and impactful
        2. Enhancing the writing style and clarity
        3. Fixing any grammatical or spelling errors
        4. Adding appropriate formatting (bold text, bullet points, numbered lists) where it improves readability
        5. Preserving all existing HTML formatting, links, and images
        
        IMPORTANT GUIDELINES:
        - Return only the improved HTML content without any additional explanations
        - Preserve all HTML tags, formatting, links, and images exactly as they appear in the original
        - Do not modify any HTML structure or attributes
        - DO NOT add any information that wasn't in the original content
        - Only format text (using <b>, <ul>, <ol>, etc.) where it genuinely improves readability
      `;
    }

    // Get the API key from environment variables
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error("DEEPSEEK_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key configuration error" },
        { status: 500 }
      );
    }

    // Make the request to DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      return NextResponse.json(
        { error: "Failed to enhance content with DeepSeek API" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const enhancedContent = data.choices[0]?.message?.content;

    if (!enhancedContent) {
      return NextResponse.json(
        { error: "No enhanced content returned from DeepSeek API" },
        { status: 500 }
      );
    }

    return NextResponse.json({ enhancedContent });
  } catch (error) {
    console.error("Error in enhance-bio API route:", error);
    return NextResponse.json(
      { error: "Failed to process bio enhancement" },
      { status: 500 }
    );
  }
} 