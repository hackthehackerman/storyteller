import { Inter } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
const inter = Inter({ subsets: ["latin"] });
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Panel.js
// This would be a new component that you create to handle the display and logic for each individual panel
function Panel({ panel }) {
  if (panel.image) {
    // Show the image
    return (
      <div className="border aspect-square">
        {/* Display the image here */}
        <img
          className="object-fill w-full h-full"
          src={panel.image}
          width={768}
          height={768}
        />
        <p class="text-base">{panel.description}</p>
      </div>
    );
  }
}

export default function Feed() {
  const [panels, setPanels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/feed");
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }
        const data = await response.json();
        console.log("result: ", data.result);
        setPanels(data.result); // Assuming the data is an array of panels
      } catch (error) {
        console.error("Error fetching data: ", error);
        // Handle error here
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  return (
    <div
      className={`flex min-h-screen flex-col gap-y-24 p-24`}
    >
      {panels
        .slice()
        .reverse()
        .map((panel, index) => (
          // <div className="h-fit w-96">
          //   <Panel key={index} panel={panel} />
          // </div>
          <div>
            <span>Comic: {index + 1}</span>

            <div className="grid grid-cols-1 gap-4 place-content-start w-fit sm:grid-cols-2">
              {panel.map((individual_panel, index) => (
                <div className="h-fit w-96">
                  <Panel
                    key={index}
                    panel={individual_panel}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
