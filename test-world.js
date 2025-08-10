// Simple test script to create a sample world
const testWorld = {
  name: "Demo World",
  description: "A demonstration world with some basic objects",
  objects: [
    {
      id: "obj_1",
      type: "cube",
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
      color: "#FF6B6B",
      material: "standard"
    },
    {
      id: "obj_2", 
      type: "sphere",
      position: [5, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#4ECDC4",
      material: "standard"
    },
    {
      id: "obj_3",
      type: "cylinder",
      position: [-5, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 2, 1],
      color: "#45B7D1",
      material: "standard"
    }
  ],
  isPublic: true,
  tags: ["demo", "sample", "test"]
};

console.log("Sample world object:", JSON.stringify(testWorld, null, 2));
