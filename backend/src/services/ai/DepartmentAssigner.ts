import { genAI, isGeminiActive } from '../../config/gemini';

export interface DepartmentAssignment {
  primaryDepartment: string;
  secondaryDepartment: string;
  escalationDepartment: string;
  assignedOfficer: string;
  expectedSLA: string; // e.g. "7 Days", "14 Days"
  reasoning: string;
}

export class DepartmentAssigner {
  static async assignDepartment(category: string, text: string): Promise<DepartmentAssignment> {
    if (isGeminiActive && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          You are a government process automation route engine.
          Assign the primary department, secondary department, escalation department, assigned officer name, and SLA (Service Level Agreement) for this complaint:
          Category: ${category}
          Description: ${text}

          Respond with a JSON object matching this structure:
          {
            "primaryDepartment": "PWD (Public Works Department)",
            "secondaryDepartment": "Finance",
            "escalationDepartment": "District Magistrate Office",
            "assignedOfficer": "Rajesh Kumar (Executive Engineer)",
            "expectedSLA": "7 Days",
            "reasoning": "Road repairs fall under PWD with standard emergency repair SLA."
          }
        `;

        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text()) as DepartmentAssignment;
      } catch (error) {
        console.error('DepartmentAssigner Live API error, using fallback:', error);
      }
    }

    // Fallback Mapping
    let primaryDepartment = 'Municipality';
    let secondaryDepartment = 'Finance';
    let escalationDepartment = 'District Collector Office';
    let assignedOfficer = 'Amit Sharma (Nodal Officer)';
    let expectedSLA = '10 Days';
    let reasoning = `Category "${category}" mapped to local municipality administration guidelines.`;

    if (category === 'Roads & Transport') {
      primaryDepartment = 'PWD (Public Works Department)';
      secondaryDepartment = 'NHAI / Traffic Police';
      escalationDepartment = 'State Ministry of PWD';
      assignedOfficer = 'Sanjay Sen (Executive PWD Engineer)';
      expectedSLA = '7 Days';
      reasoning = 'Road infrastructure works fall under PWD for maintenance and budget laying.';
    } else if (category === 'Water Supply') {
      primaryDepartment = 'PHED (Public Health Engineering Department)';
      secondaryDepartment = 'Water Sanitation Committee';
      escalationDepartment = 'Jal Shakti Ministry';
      assignedOfficer = 'Ramesh Verma (Chief Water Inspector)';
      expectedSLA = '5 Days';
      reasoning = 'Water pipe breaches and pump failures are classified as high-priority public health concerns.';
    } else if (category === 'Electricity & Power') {
      primaryDepartment = 'State Electricity Distribution Board (DISCOM)';
      secondaryDepartment = 'Solar Energy Development Agency';
      escalationDepartment = 'Ministry of Power';
      assignedOfficer = 'Sunil Mehta (Sub-divisional Officer)';
      expectedSLA = '3 Days';
      reasoning = 'Grid failures, loose cables, and transformer issues represent extreme safety hazards.';
    } else if (category === 'Sanitation & Waste') {
      primaryDepartment = 'Municipal Waste Corporation';
      secondaryDepartment = 'Health & Safety';
      escalationDepartment = 'State Pollution Control Board';
      assignedOfficer = 'Karan Johar (Sanitary Superintendent)';
      expectedSLA = '4 Days';
      reasoning = 'Blocked open sewers and garbage dump accumulation fall under direct waste disposal SLAs.';
    } else if (category === 'Healthcare') {
      primaryDepartment = 'Department of Health & Family Welfare';
      secondaryDepartment = 'Civil Hospital Board';
      escalationDepartment = 'State Health Secretary';
      assignedOfficer = 'Dr. Priya Das (Chief Medical Officer)';
      expectedSLA = '5 Days';
      reasoning = 'PHC equipment availability and vaccination supplies are routed to the Health Ministry.';
    } else if (category === 'Education') {
      primaryDepartment = 'Department of School Education & Literacy';
      secondaryDepartment = 'Sarva Shiksha Abhiyan';
      escalationDepartment = 'Director of Education';
      assignedOfficer = 'Meena Gupta (District Education Officer)';
      expectedSLA = '14 Days';
      reasoning = 'Government school building repair and staff vacancies fall under Education guidelines.';
    }

    return {
      primaryDepartment,
      secondaryDepartment,
      escalationDepartment,
      assignedOfficer,
      expectedSLA,
      reasoning
    };
  }
}
