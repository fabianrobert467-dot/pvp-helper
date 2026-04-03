let pets = [];

async function loadData() {
  const res = await fetch("./pets.json");
  pets = await res.json();

  const petA = document.getElementById("petA");
  const petB = document.getElementById("petB");

  pets.forEach((pet, i) => {
    petA.add(new Option(pet.name, i));
    petB.add(new Option(pet.name, i));
  });
}

function simulate() {
  const petA = pets[document.getElementById("petA").value];
  const petB = pets[document.getElementById("petB").value];

  let aSpeed = petA.speed || 100;
  let bSpeed = petB.speed || 100;

  // 示例：如果包含示弱则降低速度
  if (petA.skills.includes("示弱")) {
    aSpeed *= 0.8;
    bSpeed *= 1.2;
  }

  const winner = aSpeed > bSpeed ? petA.name : petB.name;
  document.getElementById("result").innerText = "先手：" + winner;
}

loadData();