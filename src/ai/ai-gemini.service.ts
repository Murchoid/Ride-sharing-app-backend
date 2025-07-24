import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable()
export class AiGeminiService {
  private readonly ai: GoogleGenAI;

  constructor(private config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
    });
  }

  private async runPrompt(prompt: string, modelId = 'gemini-2.5-flash'): Promise<string | undefined> {
    const res: GenerateContentResponse = await this.ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return res.text;
  }

  async generateBookingSQL(nlPrompt: string, schema: string): Promise<string | undefined> {
    const prompt = `
You are an SQL assistant for a ride-sharing app. Based on the schema below, generate a safe SQL INSERT statement.

Schema:
${schema}

Request:
"${nlPrompt}"

Only return SQL.
`;
    return this.runPrompt(prompt);
  }

  async generateAnalyticsSQL(nlQuery: string, schema: string, enumSchema: string): Promise<string | undefined> {
    const prompt = `
You are a PostgreSQL assistant. Based on the schemas below, generate a safe SELECT SQL query.

- Always use double quotes for all column and table names (e.g. "createdAt", "paymentStatus").
- Only return SQL. Start with SELECT.
- If the query requires filtering by a specific  ID, use the placeholder {{id}} in the SQL.

Enums schema:
${enumSchema}

Schema:
${schema}

Question:
"${nlQuery}"
`;
    return this.runPrompt(prompt);
  }

  async classifyIntent(userPrompt: string): Promise<string | undefined> {
    const prompt = `
You are a ride-sharing assistant. Categorize this user request into exactly one of:
create_booking, analytics_query, general_help.

If it is create_booking, the user has to explicitly give the source and destination.
Message:
"${userPrompt}"
`;
    return this.runPrompt(prompt);
  }

  async generateHelpResponse(userPrompt: string): Promise<string | undefined> {
    const prompt = `
You are a helpful and friendly assistant for a ride-sharing app called RideIO.

The app allows users to:
- Book rides by specifying pickup and dropoff locations
- Track current and past rides
- View payment status and history
- Access support for payments, cancellations, and account issues
- Drivers and admins have dashboards for managing rides and analytics

The user might ask any question related to the app, such as how to use a feature, solve a problem, or give feedback.

Answer clearly and politely. Use markdown formatting if helpful. Avoid long paragraphs.

User message:
"${userPrompt}"
`;

    return this.runPrompt(prompt);
  }

  async generateDriverHelpResponse(userPrompt: string, schema: string, driverId: string, enumSchema: string): Promise<string | undefined> {
     const prompt = `
You are a PostgreSQL assistant. Based on the database schemas below, generate a safe SELECT SQL query for the following analytics question.

- Always use double quotes for all column and table names (e.g. "createdAt", "paymentStatus").
- Only return SQL. Start with SELECT.

Enums:
${enumSchema}

Schema:
${schema}

Question:
"${userPrompt}"

${driverId ? `Limit results to only data for driver with ID "${driverId}".` : ''}

Only return SQL. No explanation. Start with SELECT.
`;
    return this.runPrompt(prompt);
  }

  async generateBookingValues(nlPrompt: string, schema: string, enumSchema: string): Promise<string | undefined> {
    const prompt = `
You are an assistant for a ride-sharing app. Based on the schemas below, generate a JSON object containing all the required fields and values for a new booking.

Enums schema:
${enumSchema}

Schema:
${schema}

Request:
"${nlPrompt}"

Only output a valid JSON object with the booking fields and values. Do not include any explanation or SQL.
`;
    return this.runPrompt(prompt);
  }
}
