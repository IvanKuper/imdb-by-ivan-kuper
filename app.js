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
  awards: document.getElementById("awards"),
  directors: document.getElementById("directors"),
  language: document.getElementById("language"),
  releaseDate: document.getElementById("releasedate"),
  sM: document.getElementById("smilier-title"),
  productionCompany: document.getElementById("productionCompany"),
  loadMore: document.getElementById("loadMore"),
  loadMoreDiv: document.getElementById("loadmorediv"),
  message: document.getElementById("message"),
  ribbon: document.querySelector(".ribbon-2"),
};
var apiKey = ""; // add your own imdb-api.com key

// Hiding all page section before search
elements.sectionCenter.style = "display: none;";
elements.sM.style = "display: none;";
loader.style = "display: none;";

// Api
var loadData = async (value) => {
  try {
    loader.style = "display: block;";
    let res = await axios.get(
      `https://imdb-api.com/en/API/Search/${apiKey}/${value}`
    );
    loader.style = "display: none;";
    elements.sectionCenter.style = "display: block;";
    elements.sM.style = "display: block;";
    elements.bottom.style = "display: grid;";
    let specificMovie = res.data.results[0];
    let specificMovieExpanded = await axios.get(
      `https://imdb-api.com/en/API/Title/${apiKey}/${specificMovie.id}`
    );

    console.log(specificMovieExpanded.data);
    updateElements(specificMovieExpanded.data);
    console.log(specificMovieExpanded.data);
  } catch (err) {
    elements.sectionCenter.style = "display: none;";
    elements.sM.style = "display: none;";
    elements.bottom.style = "display: none;";
    elements.message.innerHTML = "Something went wrong, Please try agian.";
    loader.style = "display: none;";
    console.log(err);
  }
};

var search = () => {
  let value = elements.input.value;
  if (value == "") {
    elements.message.innerHTML = "Please Enter Movie Name!";
  } else {
    elements.input.value = "";
    elements.message.innerHTML = "";
    elements.sectionCenter.style = "display: none;";
    elements.sM.style = "display: none;";
    elements.bottom.style = "display: none;";
    loadData(value);
  }
};

elements.searchBtn.addEventListener("click", search);
elements.input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    search();
  }
});

var updateElements = (movie) => {
  clearData();
  elements.mainTitle.innerHTML = movie.fullTitle;
  elements.runTime.innerHTML = movie.runtimeStr;
  elements.poster.src = movie.image;
  elements.desc.innerHTML = movie.plot;
  elements.genre.innerHTML = movie.genres;
  elements.directors.innerHTML = movie.directors;
  elements.awards.innerHTML = movie.awards;
  elements.language.innerHTML = movie.languages;
  elements.releaseDate.innerHTML = movie.releaseDate;
  elements.productionCompany.innerHTML = movie.companies;
  elements.ribbon.innerHTML = `<i class="fa-solid fa-star"> ${movie.imDbRating}</i>`;

  for (let i = 0; i < 1; i++) {
    elements.actors.innerHTML += movie.stars;
  }

  let actors = movie.actorList;

  // Loops which prints 3 actors
  for (let i = 0; i < 3; i++) {
    elements.actors.innerHTML += `<span> ${actors[i].name} as ${actors[i].asCharacter}</span>`;
  }

  // let rating = movie.imDbRating;

  // // Loop which prints rating solid stars
  // for (let i = 0; i < Math.round(rating); i++) {
  //   elements.ribbon.innerHTML += `<i class="fa-solid fa-star"></i>`;
  // }
  // // Loop which prints rating empthy stars
  // for (let i = 0; i < 10 - Math.round(rating); i++) {
  //   elements.ribbon.innerHTML += `<i class="fa-regular fa-star"></i>`;
  // }

  // Loop which prints similier movies
  for (let i = 0; i < 8; i++) {
    elements.bottom.innerHTML += `<div class="movieBox mt-4 mb-1"><h4 class="movieTitle text-center">${movie.similars[i].title}</h4><img src="${movie.similars[i].image}" class="poster smilierPoster"></div>`;
  }

  let similars = document.querySelectorAll(".movieBox");
  similars.forEach((box) => {
    box.addEventListener("click", (e) => {
      let newSearch;
      if (e.target.localName == "h1") {
        newSearch = e.target.innerText;
      } else {
        newSearch = e.target.parentElement.children[0].innerText;
      }
      loadData(newSearch);
    });
  });
};

// Clear all data
var clearData = () => {
  elements.rating.innerHTML = "";
  elements.actors.innerHTML = "";
  elements.bottom.innerHTML = "";
  elements.loader.style = "display: none";
};
