import { Inter } from "next/font/google";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
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
function Panel({
  panel,
  onInputChange,
  onButtonClick,
  onOptionClick,
}) {
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
  } else if (panel.loading) {
    return (
      <div className="border aspect-square p-4">
        {/* Display a loading indicator here */}
        generating...
      </div>
    );
  } else if (panel.editable) {
    // Show input and button to submit
    return (
      <div className="border aspect-square p-4 gap-y-4 flex flex-col">
        {/* {panels.map((panel, index) => (
          <Panel
            key={index}
            panel={panel}
            onInputChange={(e) =>
              handleInputChange(e, index)
            }
            onButtonClick={() => handleButtonClick(index)}
          />
        ))} */}
        <div className="flex flex-col gap-y-4">
          {panel.options.map((option, index) => (
            // <Panel
            //   key={index}
            //   panel={panel}
            //   onInputChange={(e) =>
            //     handleInputChange(e, index)
            //   }
            //   onButtonClick={() => handleButtonClick(index)}
            // />
            <Button
              variant="secondary"
              className="h-full"
              onClick={() => {
                onOptionClick(option.option);
              }}
            >
              <span>{option.option}</span>
            </Button>
          ))}
        </div>

        <div className="flex justify-center">
          {panel.options.length > 0 && <div> --or-- </div>}
        </div>

        <Input
          value={panel.description}
          onChange={onInputChange}
          placeholder="write your own story..."
        />
        <Button onClick={onButtonClick}>Generate</Button>
      </div>
    );
  } else {
    // Show options or a disabled input
    return (
      <div className="border aspect-square p-4">
        {/* Display options or a disabled input here */}
      </div>
    );
  }
}

export default function Home() {
  const [panels, setPanels] = useState([
    {
      description: "",
      image: null,
      options: [],
      editable: true,
      loading: false,
    },
    {
      description: "",
      image: null,
      options: [],
      editable: false,
      loading: false,
    },
    {
      description: "",
      image: null,
      options: [],
      editable: false,
      loading: false,
    },
    {
      description: "",
      image: null,
      options: [],
      editable: false,
      loading: false,
    },
  ]);

  // Handler for the input change
  const handleInputChange = useCallback(
    (event, index) => {
      const newPanels = [...panels];
      newPanels[index].description = event.target.value;
      setPanels(newPanels);
    },
    [panels]
  );

  const handleButtonClick = useCallback(
    (index) => {
      // Validate the description
      if (!panels[index].description) {
        alert("Please enter a description.");
        return;
      }

      // set loading
      var newPanels = [...panels];
      newPanels[index].loading = true;
      setPanels(newPanels);

      // image prompt
      var imagePrompt =
        "You are generating one panel for a comic for kids. The story so far is: ";
      for (var i = 0; i < index; i++) {
        imagePrompt =
          imagePrompt + panels[i].description + ". ";
      }
      imagePrompt =
        imagePrompt +
        "The panel you are generating is: " +
        panels[index].description +
        ".";
      imagePrompt =
        imagePrompt +
        " You should only generate one square of the panel, not the full comic. Make sure you are generate just a square.";
      if (selectValue) {
        imagePrompt =
          imagePrompt +
          " The style of the comic is " +
          selectValue +
          ".";
      }

      // options prompt
      var optionsPrompt =
        "You are generate two options for what happened in the next panel, of a four panel comic. Makes the options interesting and dramatic. But keeps this very safe for children. Do not include number in the options, only use text in the options. The current story so far is: ";
      for (var i = 0; i <= index; i++) {
        optionsPrompt =
          optionsPrompt + panels[i].description + ". ";
      }

      if (index == 2) {
        optionsPrompt =
          optionsPrompt +
          " This is the last panel, make the options a grand finale!";
      }

      fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagePrompt: imagePrompt,
          optionsPrompt: optionsPrompt,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " +
                response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);

          newPanels = [...panels];
          newPanels[index].image = data.url;
          newPanels[index].loading = false;
          newPanels[index].editable = false;

          // Enable the next panel
          if (index < panels.length - 1) {
            newPanels[index + 1].options =
              data.options.options;
            newPanels[index + 1].editable = true;
          }

          setPanels(newPanels);
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          );
          var newPanels = [...panels];
          newPanels[index].loading = false;
          setPanels(newPanels);
        });
    },
    [panels]
  );

  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublishClick = useCallback(() => {
    const payload = [
      {
        description: panels[0].description,
        image: panels[0].image,
      },
      {
        description: panels[1].description,
        image: panels[1].image,
      },
      {
        description: panels[2].description,
        image: panels[2].image,
      },
      {
        description: panels[3].description,
        image: panels[3].image,
      },
    ];

    setLoading(true);
    setPublished(false);

    fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok " +
              response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setLoading(false);
        setPublished(true);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });
  }, [panels]);

  const [selectValue, setSelectValue] = useState("");
  const handleSelectChange = (value) => {
    console.log(selectValue);
    console.log(value);
    setSelectValue(value);
  };

  return (
    <div
      className={`flex min-h-screen flex-col gap-y-2 p-24 ${inter.className}`}
    >
      <h1>Story Teller</h1>
      <h2>
        Story teller is an interactive comic generator where
        you can create your own stories
      </h2>
      <h2>
        Check out other people's creations{" "}
        <Link href="/feed" className="text-blue-600">
          Here
        </Link>
      </h2>
      <div className="flex flex-row items-center gap-x-2">
        <Select
          onValueChange={handleSelectChange}
          defaultValue={selectValue}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a style" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Tin Tin">
                Tintin
              </SelectItem>
              <SelectItem value="Dr. Seuss">
                Dr. Seuss
              </SelectItem>
              <SelectItem value="Peanuts ">
                Peanuts
              </SelectItem>
              <SelectItem value="Calvin and Hobbes">
                Calvin and Hobbes
              </SelectItem>
              <SelectItem value=" R. Crumb">
                R. Crumb
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 place-content-start w-fit sm:grid-cols-2">
        {panels.map((panel, index) => (
          <div className="h-fit w-96">
            <Panel
              key={index + "asdasd"}
              panel={panel}
              onInputChange={(e) =>
                handleInputChange(e, index)
              }
              onButtonClick={() => handleButtonClick(index)}
              onOptionClick={(description) => {
                const newPanels = [...panels];
                newPanels[index].description = description;
                setPanels(newPanels);
                handleButtonClick(index);
              }}
            />
          </div>
        ))}
      </div>

      {panels[0].image != null &&
        panels[1].image != null &&
        panels[2].image != null &&
        panels[3].image != null &&
        !loading &&
        !published && (
          <Button onClick={handlePublishClick}>
            Publish
          </Button>
        )}

      {panels[0].image != null &&
        panels[1].image != null &&
        panels[2].image != null &&
        panels[3].image != null &&
        loading && <div>Publishing...</div>}

      {panels[0].image != null &&
        panels[1].image != null &&
        panels[2].image != null &&
        panels[3].image != null &&
        !loading &&
        published && (
          <div>
            Published! Check out your work{" "}
            <Link href="/feed" className="text-blue-600">
              Here
            </Link>
          </div>
        )}
    </div>
  );
}
