
import React from 'react';
import { AssetStatus, TechProfile, Tool, Refrigerant } from './types';

export const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzgb--GW4m8j9pFhki5HIp81p1dMaeM5jD2NFm1SBOiTZyG0gEnYR4mLO_lsA71tk55fp/exec';

export const INITIAL_TECHS: TechProfile[] = [
  { name: 'Bilal', points: 150, demerits: 0, attendance: true, tasks: ['Routine Filter Cleaning - 3rd Floor', 'Check Gas Pressure - Server Room'] },
  { name: 'Asad', points: 120, demerits: 25, attendance: true, tasks: ['Capacitor Replacement - Ground Floor'] },
  { name: 'Taimoor', points: 180, demerits: 0, attendance: true, tasks: ['Thermostat Calibration - Admin Block'] },
  { name: 'Saboor', points: 90, demerits: 50, attendance: false, tasks: ['Outdoor Unit Descaling - Library'] },
];

export const DEFAULT_TOOLS: Tool[] = [
  { name: 'Adjustable Wrench', quantity: 4 },
  { name: 'Pliers Set', quantity: 2 },
  { name: 'Screwdriver Plus & Minus', quantity: 2 },
  { name: 'Amp Meter', quantity: 2 },
  { name: 'High Pressure Gauge', quantity: 2 },
  { name: 'Charging Line', quantity: 6 },
  { name: 'Flaring Tool', quantity: 2 },
  { name: 'Allen Key Set', quantity: 2 },
  { name: 'Swaging Tool', quantity: 1 },
  { name: 'File', quantity: 2 },
  { name: 'Tube Bender', quantity: 1 },
  { name: 'Tool Bag', quantity: 2 },
];

export const INITIAL_REFRIGERANTS: Refrigerant[] = [
  { name: 'R22', type: 'AC', kg: 40 },
  { name: 'R410', type: 'AC', kg: 40 },
  { name: 'R32', type: 'AC', kg: 40 },
  { name: 'R600', type: 'Fridge', kg: 40 },
  { name: 'R134', type: 'Fridge', kg: 40 },
];

export const CAMPUSES = ['Main Campus', 'North Campus', 'South Campus'];
export const FLOORS = ['Ground', '1st', '2nd', '3rd', 'Roof'];

export const DEMERIT_REASONS = [
  { reason: 'Missed Checklist', points: 25 },
  { reason: 'Attitude Issue', points: 20 },
  { reason: 'Safety Violation', points: 30 },
  { reason: 'Late Attendance', points: 10 },
  { reason: 'Tool Misplacement', points: 15 },
];
