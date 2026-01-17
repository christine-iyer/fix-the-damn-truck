// client/helpers/api.ts

const API_URL = "http://localhost:5001/api"; 

export const vehicleProfile = async (vehicleData: any) => {
    try {
      const res = await fetch(`${API_URL}/vehicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData)
      });
  
      const text = await res.text(); // get raw response
  
      try {
        return JSON.parse(text); // try parsing JSON
      } catch {
        return { success: false, message: `Invalid JSON response: ${text}` };
      }
  
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };
  