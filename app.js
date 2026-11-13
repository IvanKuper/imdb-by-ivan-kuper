const elements = {
  input: document.getElementById("search-field"),
  searchBtn: document.getElementById("search-btn"),
  mainTitle: document.getElementById("movieTitle"),
  rating: document.getElementById("_rating"),
  poster: document.getElementById("mainPoster"),
  desc: document.getElementById("desc"),
  runTime: document.getElementById("runtime"),
  genre: document.getElementById("genre"),
  actors: document.getElementById("actors"),
  bottom: document.querySelector(".bottom"),
  loader: document.getElementById("loader"),
  sectionCenter: document.querySelector(".center"),
  status: document.getElementById("awards"),
  creators: document.getElementById("directors"),
  language: document.getElementById("language"),
  releaseDate: document.getElementById("releasedate"),
  sM: document.getElementById("smilier-title"),
  network: document.getElementById("productionCompany"),
  message: document.getElementById("message"),
  ribbon: document.querySelector(".ribbon-2"),
};

// TVmaze: free, no API key needed (the old imdb-api.com service is gone)
const API = "https://api.tvmaze.com";
const NO_POSTER = "imgs/logo.png";

const show = (el, on, display = "block") => (el.style.display = on ? display : "none");

const getJson = async (url) => {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const stripHtml = (html) =>
  new DOMParser().parseFromString(html || "", "text/html").body.textContent.trim();

const hideResults = () => {
  show(elements.sectionCenter, false);
  show(elements.sM, false);
  show(elements.bottom, false);
};

const loadData = async (query, id) => {
  hideResults();
  elements.message.textContent = "";
  show(elements.loader, true);
  try {
    const embed = "embed[]=cast&embed[]=crew";
    const main = id
      ? await getJson(`${API}/shows/${id}?${embed}`)
      : await getJson(`${API}/singlesearch/shows?q=${encodeURIComponent(query)}&${embed}`);
    if (!main) {
      elements.message.textContent = "No show found, try another name.";
      return;
    }
    const others = await getJson(`${API}/search/shows?q=${encodeURIComponent(query || main.name)}`);
    updateElements(main, (others || []).map((r) => r.show).filter((s) => s.id !== main.id));
  } catch (err) {
    console.error(err);
    elements.message.textContent = "Something went wrong, please try again.";
  } finally {
    show(elements.loader, false);
  }
};

const search = () => {
  const value = elements.input.value.trim();
  if (!value) {
    elements.message.textContent = "Please enter a show name!";
    return;
  }
  elements.input.value = "";
  loadData(value);
};

elements.searchBtn.addEventListener("click", search);
elements.input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") search();
});

const updateElements = (s, similars) => {
  const year = s.premiered ? ` (${s.premiered.slice(0, 4)})` : "";
  const cast = s._embedded?.cast || [];
  const creators = (s._embedded?.crew || []).filter((c) => c.type === "Creator");
  const runtime = s.runtime || s.averageRuntime;

  elements.mainTitle.textContent = s.name + year;
  elements.rating.textContent = "";
  elements.poster.src = s.image?.original || s.image?.medium || NO_POSTER;
  elements.poster.alt = `${s.name} poster`;
  elements.desc.textContent = stripHtml(s.summary) || "No description.";
  elements.genre.textContent = s.genres.join(", ") || "-";
  elements.runTime.textContent = runtime ? `${runtime} min per episode` : "-";
  elements.language.textContent = s.language || "-";
  elements.releaseDate.textContent = s.premiered || "-";
  elements.network.textContent = (s.network || s.webChannel)?.name || "-";
  elements.status.textContent = s.ended ? `${s.status} (${s.ended.slice(0, 4)})` : s.status || "-";
  elements.creators.textContent = creators.map((c) => c.person.name).join(", ") || "-";
  elements.actors.textContent =
    cast.slice(0, 3).map((c) => `${c.person.name} as ${c.character.name}`).join(", ") || "-";
  elements.ribbon.innerHTML = "";
  if (s.rating?.average) {
    const star = document.createElement("i");
    star.className = "fa-solid fa-star";
    star.textContent = ` ${s.rating.average}`;
    elements.ribbon.append(star);
  }

  elements.bottom.innerHTML = "";
  similars.slice(0, 8).forEach((m) => {
    const box = document.createElement("div");
    box.className = "movieBox mt-4 mb-1";
    const title = document.createElement("h4");
    title.className = "movieTitle text-center";
    title.textContent = m.name;
    const img = document.createElement("img");
    img.className = "poster smilierPoster";
    img.src = m.image?.medium || NO_POSTER;
    img.alt = `${m.name} poster`;
    box.append(title, img);
    box.addEventListener("click", () => {
      loadData(null, m.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    elements.bottom.append(box);
  });

  show(elements.sectionCenter, true);
  show(elements.sM, similars.length > 0);
  show(elements.bottom, similars.length > 0, "grid");
};

hideResults();
show(elements.loader, false);
