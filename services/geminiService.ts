
import { GoogleGenAI } from "@google/genai";
import { Ticket, TechProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function smartAssignTask(ticket: Ticket, techs: TechProfile[]): Promise<string> {
  const activeTechs = techs.filter(t => t.attendance).map(t => ({
    name: t.name,
    taskCount: t.tasks.length,
    points: t.points
  }));

  if (activeTechs.length === 0) return 'Unassigned (No Active Techs)';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following technicians and their current workload, suggest the best technician to assign a new ${ticket.severity} issue: "${ticket.issue}". 
    Consider workload (fewer tasks is better) and attendance.
    Technicians: ${JSON.stringify(activeTechs)}
    Output only the name of the technician.`,
  });

  const suggestedName = response.text?.trim() || activeTechs[0].name;
  return suggestedName;
}

export async function getSmartDiagnostic(issue: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert HVAC diagnostic AI. A user reported an issue: "${issue}". 
    Provide a concise, 3-step diagnostic check for a field technician. Keep it professional.`,
  });
  return response.text || "No diagnostic available.";
}
