import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
          .append(new ElementBuilder("img").with("src", movie.Poster))
          .append(new ElementBuilder("h1").text(movie.Title))
          .append(new ElementBuilder("p")
              .append(new ElementBuilder("button").text("Edit")
                    .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
          .append(new ParagraphBuilder().items(
              "Runtime " + formatRuntime(movie.Runtime),
              "\u2022",
              "Released on " +
                new Date(movie.Released).toLocaleDateString("en-US")))
          .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
          .append(new ElementBuilder("p").text(movie.Plot))
          .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
          .append(new ListBuilder().items(movie.Directors))
          .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
          .append(new ListBuilder().items(movie.Writers))
          .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
          .append(new ListBuilder().items(movie.Actors))
          .appendTo(element);
}

const buildList = function (list) {
  return '<ul class="comma-joined-list">' + list.map(item => {
    return `<li>${item}</li>`
  }).join("") + "</ul>";

}

const buildTiledList = function (list) {
  return '<ul class="tiled-list">' + list.map(item => {
    return `<li>${item}</li>`
  }).join("") + "</ul>";
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        const movieCard = `
        <article id="${movie.imdbID}" class="movie-container">
                <section id="movie-top">
                    <div class="movie-basic-info">
                        <header><h1>${movie.Title}</h1></header>
                        <ul class="movie-facts">
                            <li>${new Date(movie.Released).toLocaleDateString("de-AT")}</li>
                            <li>${(movie.Runtime / 60) | 0}h ${movie.Runtime % 60}m</li>
                        </ul>
                    </div>
                    <table class="movie-ratings">
                        <tr>
                            <td>IMDB Rating</td>
                            <td>Metascore</td>
                        </tr>
                        <tr>
                            <td>${movie.imdbRating}</td>
                            <td>${movie.Metascore}</td>
                        </tr>
                    </table>
                </section>

                <img src="${movie.Poster}" alt="${movie.Title}">

                <section class="movie-info">
                    <div class="section">${buildTiledList(movie.Genres)}</div>
                    <p>${movie.Plot}</p>
                    <div class="section"><p><strong>Director${(movie.Directors.length === 1 ? "" : "s")}:</strong></p>${buildList(movie.Directors)}</div>
                    <div class="section"><p><strong>Writer${(movie.Writers.length === 1 ? "" : "s")}:</strong></p> ${buildList(movie.Writers)}</div>
                    <div class="section"><p><strong>Actor${(movie.Actors.length === 1 ? "" : "s")}:</strong></p> ${buildList(movie.Actors)}</div>
                </section>
                <button onclick="window.location.href='edit.html?imdbID=${movie.imdbID}'">Edit</button>
        </article>
    `;
        mainElement.insertAdjacentHTML('beforeend', movieCard);
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)
  /* Task 1.4. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.set("genre", genre);
  }
  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
      const genres = JSON.parse(xhr.responseText);
      const html = `
        <li><button onclick="loadMovies()">All Movies</button></li>
        ${genres.map(genre => {
        return `<li><button onclick="loadMovies('${genre}')">${genre}</button></li>`
      }).join('')}
      `;
      listElement.innerHTML = html;
      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};

window.loadMovies = loadMovies;
