//fields
let mangaList = [];
let searchQuery = "";
// let filters = {};
// let genres = {};
let subscribed;
let searchResults = [];
let csrfToken;

//searches for manga in jikan API
const searchManga = () => {
  fetch(
    `https://api.jikan.moe/v3/search/manga?q=${searchQuery}&page=1&limit=10&type=Manga`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (document.querySelector("#addDiv")) {
        searchResults = data.results;
        ReactDOM.render(
          <AddMangaList manga={searchResults} />,
          document.querySelector("#addDiv")
        );
      } else {
        ReactDOM.render(
          <h1>Go to results tab to search for manga. Click tracked button again to retrieve manga you track.</h1>,
          document.querySelector("#trackedScrollWrap")
        );
      }
    });
};

//updates manga
const updateManga = (e) => {
  const updateForms = document.querySelectorAll(".updateForm");
  // console.log(updateForms);
  sendPut(e, updateForms);
};

//event listener to send post requests
const addManga = (e) => {
  const addForms = document.querySelectorAll(".addForm");
  // console.log(addForms);
  sendPost(e, addForms);
};

//deletes cards from datamodel and view
const deleteCard = (e, id) => {
  //weird parameter order change happened from bind method
  // console.log(e);
  // console.log(id);
  deleteManga(e);
};

//updates mangaList on server
const deleteManga = (id) => {
  const formData = `_csrf=${csrfToken}&id=${id}`;
  sendAjax("POST", "/deleteManga", formData, () => {
    // console.log("succesful deletion");
    loadMangaFromServer();
  });
};

//sends post requests
const sendPost = (e, postForms) => {
  e.preventDefault();

  for (let form of postForms) {
    if (e.target.form.id === form.id) {
      const action = form.getAttribute("action");

      let title,
        currentChapter,
        maxChapter,
        description,
        _csrf,
        imageUrl,
        notes;

      title = form.querySelector(".title");
      currentChapter = form.querySelector(".currentChapter");
      maxChapter = form.querySelector(".maxChapter");
      description = form.querySelector(".synopsis");
      _csrf = form.querySelector("input[type='hidden']");
      imageUrl = form.parentElement.parentElement
        .querySelector("img")
        .getAttribute("src");
      notes = form.querySelector(".notes");
      // let formData = `_csrf=${_csrf.value}&notes=${notes.value}&title=${title.textContent}&currentChapter=${currentChapter.value}&maxChapter=${maxChapter.textContent}&description=${description.value}&imageUrl=${imageUrl}`;
      let formData;
      if (subscribed) {
        formData = `_csrf=${_csrf.value}&notes=${
          notes.value || `put notes here`
        }&title=${title.textContent}&currentChapter=${
          currentChapter.value
        }&maxChapter=${maxChapter.textContent}&description=${
          description.value
        }&imageUrl=${imageUrl}`;
      } else {
        formData = `_csrf=${_csrf.value}&notes=put notes here&title=${title.textContent}&currentChapter=${currentChapter.value}&maxChapter=${maxChapter.textContent}&description=${description.value}&imageUrl=${imageUrl}`;
      }
      // console.log(formData);
      sendAjax("POST", action, formData, (result) => {
        mangaList.push(result[0]);
      });

      e.preventDefault();
    }
  }

  return false;
};

//sends put requests
const sendPut = (e, updateForms) => {
  e.preventDefault();

  for (let form of updateForms) {
    if (e.target.form.id === form.id) {
      const action = form.getAttribute("action");

      let title,
        currentChapter,
        maxChapter,
        description,
        _csrf,
        imageUrl,
        notes;

      title = form.querySelector(".title");
      currentChapter = form.querySelector(".currentChapter");
      maxChapter = form.querySelector(".maxChapter");
      description = form.querySelector(".description");
      _csrf = form.querySelector("input[type='hidden']");
      imageUrl = form.parentElement.parentElement
        .querySelector("img")
        .getAttribute("src");
      notes = form.querySelector(".notes");
      // let formData = `_csrf=${_csrf.value}&notes=${notes.value}&title=${title.textContent}&currentChapter=${currentChapter.value}&maxChapter=${maxChapter.value}&description=${description.value}&imageUrl=${imageUrl}`;
      let formData;
      if (subscribed) {
        formData = `_csrf=${_csrf.value}&notes=${notes.value || `put notes here`}&title=${title.textContent}&currentChapter=${currentChapter.value}&maxChapter=${maxChapter.value}&description=${description.value}&imageUrl=${imageUrl}`;
      } else {
        formData = `_csrf=${_csrf.value}&notes=put notes here&title=${title.textContent}&currentChapter=${currentChapter.value}&maxChapter=${maxChapter.value}&description=${description.value}&imageUrl=${imageUrl}`;
      }
      // console.log(formData);
      sendAjax("POST", action, formData, (result) => {
        mangaList.push(result[0]);
      });

      e.preventDefault();
    }
  }
  loadMangaFromServer();
  return false;
};

//searchbar component
const SearchBar = (props) => {
  return (
    <section>
      <h1 className="is-size-1">MangaTracker</h1>
      <h5 className="is-size-3">Search for a manga and track your progress.</h5>
      <input
        type="search"
        name="searchbar"
        id="searchbar"
        placeholder="Search Manga"
        className="input"
        onChange={(e) => {
          searchQuery = e.target.value;
        }}
      />
      <input
        onClick={searchManga}
        type="submit"
        value="Search"
        className="input"
      />
    </section>
  );
};

//controls component
const Controls = (props) => {
  return (
    <section>
      <form id="getForm" action="/getManga" method="GET">
        <div className="box">
          <button
            onClick={() => {
              ReactDOM.render(
                <AddSection csrf={csrfToken} />,
                document.querySelector("#content")
              );
            }}
            type="button"
            className="button"
            id="resultButton"
          >
            Results
          </button>
          <button
            onClick={() => {
              ReactDOM.render(
                <TrackedSection csrf={csrfToken} />,
                document.querySelector("#content")
              );
              loadMangaFromServer();
            }}
            type="button"
            className="button"
            id="trackButton"
          >
            Tracked
          </button>
          <button
            onClick={() => {
              sendAjax("POST", "/subscribe", `_csrf=${csrfToken}`, () => {
                location.reload();
              });
            }}
            type="button"
            className="button"
            id="subscribeButton"
          >
            SubscribeToggle
          </button>
        </div>
      </form>
    </section>
  );
};

//add section component
const AddSection = (props) => {
  return (
    <section id="addSection">
      <h1 className="is-size-3">Add a manga:</h1>
      <div id="addDiv"></div>
    </section>
  );
};

//tracked section component
const TrackedSection = (props) => {
  return (
    <section>
      <h1 className="is-size-3">Tracked Manga:</h1>
      <div id="trackedScrollWrap"></div>
    </section>
  );
};

//add mangalist component
const AddMangaList = function (props) {
  if (props.manga.length === 0) {
    return (
      <div className="mangaList">
        <h3 className="emptyMangaList">No Manga yet</h3>
      </div>
    );
  }

  const mangaNodes = props.manga.map(function (result) {
    if (subscribed) {
      return (
        <section className="resultCard">
          <div className="box">
            <article className="media">
              <div className="media-left">
                <figure className="image">
                  <img src={result.image_url} alt={result.title} />
                </figure>
              </div>
              <div className="media-content">
                <form
                  id={result.title.replace(/\s/g, "")}
                  className="addForm"
                  action="/addManga"
                  method="POST"
                >
                  <h1 className="title">{result.title}</h1>
                  <label className="label" for="currentChapter">
                    Current Chapter
                  </label>
                  <input
                    type="number"
                    name="currentChapter"
                    min="1"
                    max="9999"
                    className="input currentChapter"
                  />
                  <label className="label" for="maxChapter">
                    Max Chapters(can be adjusted later)
                  </label>
                  <p className="maxChapter">{result.chapters}</p>
                  <label className="label" for="synopsis">
                    Synopsis
                  </label>
                  <textarea className="textarea synopsis">
                    {result.synopsis}
                  </textarea>
                  <label className="label" for="notes">
                    Notes(premium feature)
                  </label>
                  <textarea className="textarea notes"></textarea>
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    className="button"
                    onClick={addManga.bind(event)}
                    type="submit"
                  >
                    Add
                  </button>
                </form>
              </div>
            </article>
          </div>
        </section>
      );
    } else {
      return (
        <section className="resultCard">
          <div className="box">
            <article className="media">
              <div className="media-left">
                <figure className="image">
                  <img src={result.image_url} alt={result.title} />
                </figure>
              </div>
              <div className="media-content">
                <form
                  id={result.title.replace(/\s/g, "")}
                  className="addForm"
                  action="/addManga"
                  method="POST"
                >
                  <h1 className="title">{result.title}</h1>
                  <label className="label" for="currentChapter">
                    Current Chapter
                  </label>
                  <input
                    type="number"
                    name="currentChapter"
                    min="1"
                    max="9999"
                    className="input currentChapter"
                  />
                  <label className="label" for="maxChapter">
                    Max Chapters(can be adjusted later)
                  </label>
                  <p className="maxChapter">{result.chapters}</p>
                  <label className="label" for="synopsis">
                    Synopsis
                  </label>
                  <textarea className="textarea synopsis">
                    {result.synopsis}
                  </textarea>
                  <label className="label" for="notes">
                    Notes(premium feature)
                  </label>
                  <textarea disabled className="textarea notes"></textarea>
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    className="button"
                    onClick={addManga.bind(event)}
                    type="submit"
                  >
                    Add
                  </button>
                </form>
              </div>
            </article>
          </div>
        </section>
      );
    }
  });

  return <div className="mangaList">{mangaNodes}</div>;
};

//tracked mangalist component
const TrackedMangaList = function (props) {
  if (props.manga.length === 0) {
    return (
      <div className="mangaList">
        <h3 className="emptyMangaList">No Manga yet</h3>
      </div>
    );
  }

  const mangaNodes = props.manga.map(function (manga) {
    if (subscribed) {
      return (
        <section className="trackedCard">
          <div className="box">
            <article className="media">
              <div className="media-left">
                <figure className="image">
                  <img src={manga.imageUrl} alt={manga.title} />
                </figure>
              </div>
              <div className="media-content">
                <form className="updateForm" action="/updateManga" method="PUT">
                  <label className="label">Title:</label>
                  <h1 className="title">{manga.title}</h1>
                  <label className="label">Current Chapter:</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    defaultValue={manga.currentChapter}
                    className="input currentChapter"
                  />
                  <label className="label">Max Chapter:</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    defaultValue={manga.maxChapter}
                    className="input maxChapter"
                  />
                  <label className="label">Description:</label>
                  <textarea className="description textarea">
                    {manga.description}
                  </textarea>
                  <label className="label" for="notes">
                    Notes(premium feature)
                  </label>
                  <textarea className="textarea notes">{manga.notes}</textarea>
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    className="button"
                    onClick={updateManga.bind(event)}
                    type="submit"
                  >
                    Update
                  </button>
                </form>
                <button
                  className="button"
                  onClick={deleteCard.bind(event, `${manga._id}`)}
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </section>
      );
    } else {
      return (
        <section className="trackedCard">
          <div className="box">
            <article className="media">
              <div className="media-left">
                <figure className="image">
                  <img src={manga.imageUrl} alt={manga.title} />
                </figure>
              </div>
              <div className="media-content">
                <form className="updateForm" action="/updateManga" method="PUT">
                  <label className="label">Title:</label>
                  <h1 className="title">{manga.title}</h1>
                  <label className="label">Current Chapter:</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    defaultValue={manga.currentChapter}
                    className="input currentChapter"
                  />
                  <label className="label">Max Chapter:</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    defaultValue={manga.maxChapter}
                    className="input maxChapter"
                  />
                  <label className="label">Description:</label>
                  <textarea className="description textarea">
                    {manga.description}
                  </textarea>
                  <label className="label" for="notes">
                    Notes(premium feature)
                  </label>
                  <textarea disabled className="textarea notes">
                    {manga.notes}
                  </textarea>
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    className="button"
                    onClick={updateManga.bind(event)}
                    type="submit"
                  >
                    Update
                  </button>
                </form>
                <button
                  className="button"
                  onClick={deleteCard.bind(event, `${manga._id}`)}
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </section>
      );
    }
  });

  return <div className="mangaList">{mangaNodes}</div>;
};

//get method to retrieve owner's manga
const loadMangaFromServer = () => {
  sendAjax("GET", "/getManga", null, (data) => {
    // console.log(data);
    ReactDOM.render(
      <TrackedMangaList manga={data.manga} />,
      document.querySelector("#trackedScrollWrap")
    );
  });
};

//sets up page
const setup = function (csrf) {
  csrfToken = csrf;

  ReactDOM.render(<SearchBar csrf={csrf} />, document.querySelector("#search"));

  ReactDOM.render(
    <Controls csrf={csrf} />,
    document.querySelector("#controls")
  );

  ReactDOM.render(
    <AddSection csrf={csrf} />,
    document.querySelector("#content")
  );
};

//gets token
const getToken = () => {
  sendAjax("GET", "/getToken", null, (result) => {
    setup(result.csrfToken);
  });
  sendAjax("GET", "/getSubscription", null, (result) => {
    subscribed = result.subscribed;
    // console.log(subscribed);
  })
};

//initializes page
$(document).ready(function () {
  getToken();
});
