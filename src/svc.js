const url = "http://localhost:5104/";

export async function FetchFiles() {
    const response = await fetch(url + "files");
    const json = response.json();
    return json;
}

export function BuildImageUrl(path) {
    return url + "image/?path=" + path;
}