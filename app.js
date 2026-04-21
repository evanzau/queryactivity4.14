// Import Firebase tools
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyDIshfO7-fVfex9L0VBfr2C1zvd1FdEhGU",
  authDomain: "is424-f4d9d.firebaseapp.com",
  projectId: "is424-f4d9d",
  storageBucket: "is424-f4d9d.firebasestorage.app",
  messagingSenderId: "676875459440",
  appId: "1:676875459440:web:cb0c93e916b85cf5698db5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const outputDiv = document.getElementById("output");

// Helper to print results to browser
function displayResults(title, docs) {
  const section = document.createElement("div");
  section.innerHTML = `<h2>${title}</h2>`;

  if (docs.length === 0) {
    section.innerHTML += `<p>No results found.</p>`;
  } else {
    const ul = document.createElement("ul");
    docs.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = JSON.stringify(item);
      ul.appendChild(li);
    });
    section.appendChild(ul);
  }

  outputDiv.appendChild(section);
}

// Task 1: Create/store data
async function seedTeams() {
  const teams = [
    {
      teamName: "Real Madrid",
      city: "Madrid",
      country: "Spain",
      topScorers: ["Ronaldo", "Benzema", "Hazard"],
      fans: 798,
      isNationalTeam: false,
    },
    {
      teamName: "Barcelona",
      city: "Barcelona",
      country: "Spain",
      topScorers: ["Messi", "Suarez", "Puyol"],
      fans: 738,
      isNationalTeam: false,
    },
    {
      teamName: "Manchester United",
      city: "Manchester",
      country: "England",
      topScorers: ["Cantona", "Rooney", "Ronaldo"],
      fans: 755,
      isNationalTeam: false,
    },
    {
      teamName: "Manchester City",
      city: "Manchester",
      country: "England",
      topScorers: ["Sterling", "Aguero", "Haaland"],
      fans: 537,
      isNationalTeam: false,
    },
    {
      teamName: "Brazil National Team",
      city: "Not applicable",
      country: "Brazil",
      topScorers: ["Ronaldinho", "Cafu", "Bebeto"],
      fans: 950,
      isNationalTeam: true,
    },
    {
      teamName: "Argentina National Team",
      city: "Not applicable",
      country: "Argentina",
      topScorers: ["Messi", "Batistuta", "Maradona"],
      fans: 888,
      isNationalTeam: true,
    },
    {
      teamName: "Atletico Madrid",
      city: "Madrid",
      country: "Spain",
      topScorers: ["Aragonés", "Griezmann", "Torez"],
      fans: 400,
      isNationalTeam: false,
    },
  ];

  for (const team of teams) {
    await addDoc(collection(db, "teams"), team);
  }

  console.log("Teams added successfully");
}

// Helper to get plain data from snapshot
function snapshotToArray(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function runQueries() {
  // 1. Show all teams in Spain
  let q = query(collection(db, "teams"), where("country", "==", "Spain"));
  let snapshot = await getDocs(q);
  displayResults("Teams in Spain", snapshotToArray(snapshot));

  // 2. Show all teams in Madrid, Spain
  q = query(
    collection(db, "teams"),
    where("country", "==", "Spain"),
    where("city", "==", "Madrid"),
  );
  snapshot = await getDocs(q);
  displayResults("Teams in Madrid, Spain", snapshotToArray(snapshot));

  // 3. Show all national teams
  q = query(collection(db, "teams"), where("isNationalTeam", "==", true));
  snapshot = await getDocs(q);
  displayResults("National Teams", snapshotToArray(snapshot));

  // 4. Show all teams that are not in Spain
  q = query(collection(db, "teams"), where("country", "!=", "Spain"));
  snapshot = await getDocs(q);
  displayResults("Teams not in Spain", snapshotToArray(snapshot));

  // 5. Show all teams that are not in Spain or England
  // Firestore cannot do country != Spain AND != England in one simple query well.
  // Easiest approach: fetch all not Spain, then filter out England in JS.
  q = query(collection(db, "teams"), where("country", "!=", "Spain"));
  snapshot = await getDocs(q);
  let filtered = snapshotToArray(snapshot).filter(
    (team) => team.country !== "England",
  );
  displayResults("Teams not in Spain or England", filtered);

  // 6. Show all teams in Spain with more than 700M fans
  q = query(
    collection(db, "teams"),
    where("country", "==", "Spain"),
    where("fans", ">", 700),
  );
  snapshot = await getDocs(q);
  displayResults("Teams in Spain with >700M fans", snapshotToArray(snapshot));

  // 7. Show all teams with fans between 500M and 600M
  q = query(
    collection(db, "teams"),
    where("fans", ">=", 500),
    where("fans", "<=", 600),
  );
  snapshot = await getDocs(q);
  displayResults("Teams with 500M to 600M fans", snapshotToArray(snapshot));

  // 8. Show all teams where Ronaldo is a top scorer
  q = query(
    collection(db, "teams"),
    where("topScorers", "array-contains", "Ronaldo"),
  );
  snapshot = await getDocs(q);
  displayResults(
    "Teams where Ronaldo is a top scorer",
    snapshotToArray(snapshot),
  );

  // 9. Show all teams where Ronaldo, Maradona, or Messi is a top scorer
  q = query(
    collection(db, "teams"),
    where("topScorers", "array-contains-any", ["Ronaldo", "Maradona", "Messi"]),
  );
  snapshot = await getDocs(q);
  displayResults(
    "Teams where Ronaldo, Maradona, or Messi is a top scorer",
    snapshotToArray(snapshot),
  );
}

async function updateTeams() {
  const teamsRef = collection(db, "teams");

  // Find Real Madrid
  let q = query(teamsRef, where("teamName", "==", "Real Madrid"));
  let snapshot = await getDocs(q);
  const realMadridDoc = snapshot.docs[0];

  // Find Barcelona
  q = query(teamsRef, where("teamName", "==", "Barcelona"));
  snapshot = await getDocs(q);
  const barcelonaDoc = snapshot.docs[0];

  // Update primitive fields
  await updateDoc(realMadridDoc.ref, {
    fans: 811,
    teamName: "Real Madrid FC",
  });

  await updateDoc(barcelonaDoc.ref, {
    fans: 747,
    teamName: "FC Barcelona",
  });

  // Update arrays
  await updateDoc(realMadridDoc.ref, {
    topScorers: arrayRemove("Hazard"),
  });

  await updateDoc(realMadridDoc.ref, {
    topScorers: arrayUnion("Crispo"),
  });

  await updateDoc(barcelonaDoc.ref, {
    topScorers: arrayRemove("Puyol"),
  });

  await updateDoc(barcelonaDoc.ref, {
    topScorers: arrayUnion("Deco"),
  });

  // Add nested color object
  await updateDoc(realMadridDoc.ref, {
    color: {
      home: "White",
      away: "Black",
    },
  });

  await updateDoc(barcelonaDoc.ref, {
    color: {
      home: "Red",
      away: "Gold",
    },
  });

  // Update nested away colors
  await updateDoc(realMadridDoc.ref, {
    "color.away": "Purple",
  });

  await updateDoc(barcelonaDoc.ref, {
    "color.away": "Pink",
  });

  console.log("Updates completed successfully");
}

async function main() {
  // Only seed if the collection is empty to avoid duplicates on page reload
  const existingDocs = await getDocs(collection(db, "teams"));
  if (existingDocs.empty) {
    await seedTeams();
  }
  await runQueries();
  await updateTeams();
  await runQueries(); // optional: rerun to confirm updates
}

main().catch((error) => {
  console.error("Error:", error);
  outputDiv.innerHTML += `<p style="color:red;">${error.message}</p>`;
});
