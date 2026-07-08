
const url = "http://localhost:5104/";

export async function FetchFileTags() {
    const response = await fetch(url + "tags");
    const json = response.json();
    return json;
}

export function BuildImageUrl(path) {
    return url + "image/?path=" + path;
}