// To parse this data:
//
//   import { Convert, Anime } from "./file";
//
//   const anime = Convert.toAnime(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export type Anime = {
    pagination: Pagination;
    data:       Datum[];
    links:      Links;
    meta:       Meta;
}

export type MyAnime = {
    id: number;
    title: string;
    image: string;
    total_episodes: number | null;
    watched_episodes: number;
}

export type Datum = {
    mal_id:          number;
    url:             string;
    images:          { [key: string]: Image };
    trailer:         Trailer;
    approved:        boolean;
    titles:          Title[];
    title:           string;
    title_english:   null | string;
    title_japanese:  string;
    title_synonyms:  string[];
    type:            DatumType;
    source:          Source;
    episodes:        number | null;
    status:          Status;
    airing:          boolean;
    aired:           Aired;
    duration:        string;
    rating:          Rating;
    score:           number;
    scored_by:       number;
    rank:            number;
    popularity:      number;
    members:         number;
    favorites:       number;
    synopsis:        string;
    background:      null | string;
    season:          Season | null;
    year:            number | null;
    broadcast:       Broadcast;
    producers:       Demographic[];
    licensors:       Demographic[];
    studios:         Demographic[];
    genres:          Demographic[];
    explicit_genres: any[];
    themes:          Demographic[];
    demographics:    Demographic[];
}

export type Aired = {
    from:   Date;
    to:     Date | null;
    prop:   Prop;
    string: string;
}

export type Prop = {
    from: From;
    to:   From;
}

export type From = {
    day:   number | null;
    month: number | null;
    year:  number | null;
}

export type Broadcast = {
    day:      null | string;
    time:     null | string;
    timezone: Timezone | null;
    string:   null | string;
}

export type Timezone = "Asia/Tokyo";

export type Demographic = {
    mal_id: number;
    type:   DemographicType;
    name:   string;
    url:    string;
}

export type DemographicType = "anime";

export type Image = {
    image_url:       string;
    small_image_url: string;
    large_image_url: string;
}

export type Rating = "R - 17+ (violence & profanity)" | "PG-13 - Teens 13 or older" | "PG - Children" | "R+ - Mild Nudity";

export type Season = "spring" | "summer" | "fall";

export type Source = "Original" | "Manga" | "Light novel";

export type Status = "Finished Airing" | "Currently Airing";

export type Title = {
    type:  TitleType;
    title: string;
}

export type TitleType = "Default" | "Japanese" | "English" | "Synonym" | "German" | "Spanish" | "French";

export type Trailer = {
    youtube_id: null | string;
    url:        null | string;
    embed_url:  null | string;
    images:     Images;
}

export type Images = {
    image_url:         null | string;
    small_image_url:   null | string;
    medium_image_url:  null | string;
    large_image_url:   null | string;
    maximum_image_url: null | string;
}

export type DatumType = "TV" | "Movie";

export type Links = {
    first: string;
    last:  string;
    prev:  null;
    next:  string;
}

export type Meta = {
    current_page: number;
    from:         number;
    last_page:    number;
    links:        Link[];
    path:         string;
    per_page:     number;
    to:           number;
    total:        number;
}

export type Link = {
    url:    null | string;
    label:  string;
    active: boolean;
}

export type Pagination = {
    last_visible_page: number;
    has_next_page:     boolean;
    current_page:      number;
    items:             Items;
}

export type Items = {
    count:    number;
    total:    number;
    per_page: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toAnime(json: string): Anime {
        return cast(JSON.parse(json), r("Anime"));
    }

    public static animeToJson(value: Anime): string {
        return JSON.stringify(uncast(value, r("Anime")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Anime": o([
        { json: "pagination", js: "pagination", typ: r("Pagination") },
        { json: "data", js: "data", typ: a(r("Datum")) },
        { json: "links", js: "links", typ: r("Links") },
        { json: "meta", js: "meta", typ: r("Meta") },
    ], false),
    "Datum": o([
        { json: "mal_id", js: "mal_id", typ: 0 },
        { json: "url", js: "url", typ: "" },
        { json: "images", js: "images", typ: m(r("Image")) },
        { json: "trailer", js: "trailer", typ: r("Trailer") },
        { json: "approved", js: "approved", typ: true },
        { json: "titles", js: "titles", typ: a(r("Title")) },
        { json: "title", js: "title", typ: "" },
        { json: "title_english", js: "title_english", typ: u(null, "") },
        { json: "title_japanese", js: "title_japanese", typ: "" },
        { json: "title_synonyms", js: "title_synonyms", typ: a("") },
        { json: "type", js: "type", typ: r("DatumType") },
        { json: "source", js: "source", typ: r("Source") },
        { json: "episodes", js: "episodes", typ: u(0, null) },
        { json: "status", js: "status", typ: r("Status") },
        { json: "airing", js: "airing", typ: true },
        { json: "aired", js: "aired", typ: r("Aired") },
        { json: "duration", js: "duration", typ: "" },
        { json: "rating", js: "rating", typ: r("Rating") },
        { json: "score", js: "score", typ: 3.14 },
        { json: "scored_by", js: "scored_by", typ: 0 },
        { json: "rank", js: "rank", typ: 0 },
        { json: "popularity", js: "popularity", typ: 0 },
        { json: "members", js: "members", typ: 0 },
        { json: "favorites", js: "favorites", typ: 0 },
        { json: "synopsis", js: "synopsis", typ: "" },
        { json: "background", js: "background", typ: u(null, "") },
        { json: "season", js: "season", typ: u(r("Season"), null) },
        { json: "year", js: "year", typ: u(0, null) },
        { json: "broadcast", js: "broadcast", typ: r("Broadcast") },
        { json: "producers", js: "producers", typ: a(r("Demographic")) },
        { json: "licensors", js: "licensors", typ: a(r("Demographic")) },
        { json: "studios", js: "studios", typ: a(r("Demographic")) },
        { json: "genres", js: "genres", typ: a(r("Demographic")) },
        { json: "explicit_genres", js: "explicit_genres", typ: a("any") },
        { json: "themes", js: "themes", typ: a(r("Demographic")) },
        { json: "demographics", js: "demographics", typ: a(r("Demographic")) },
    ], false),
    "Aired": o([
        { json: "from", js: "from", typ: Date },
        { json: "to", js: "to", typ: u(Date, null) },
        { json: "prop", js: "prop", typ: r("Prop") },
        { json: "string", js: "string", typ: "" },
    ], false),
    "Prop": o([
        { json: "from", js: "from", typ: r("From") },
        { json: "to", js: "to", typ: r("From") },
    ], false),
    "From": o([
        { json: "day", js: "day", typ: u(0, null) },
        { json: "month", js: "month", typ: u(0, null) },
        { json: "year", js: "year", typ: u(0, null) },
    ], false),
    "Broadcast": o([
        { json: "day", js: "day", typ: u(null, "") },
        { json: "time", js: "time", typ: u(null, "") },
        { json: "timezone", js: "timezone", typ: u(r("Timezone"), null) },
        { json: "string", js: "string", typ: u(null, "") },
    ], false),
    "Demographic": o([
        { json: "mal_id", js: "mal_id", typ: 0 },
        { json: "type", js: "type", typ: r("DemographicType") },
        { json: "name", js: "name", typ: "" },
        { json: "url", js: "url", typ: "" },
    ], false),
    "Image": o([
        { json: "image_url", js: "image_url", typ: "" },
        { json: "small_image_url", js: "small_image_url", typ: "" },
        { json: "large_image_url", js: "large_image_url", typ: "" },
    ], false),
    "Title": o([
        { json: "type", js: "type", typ: r("TitleType") },
        { json: "title", js: "title", typ: "" },
    ], false),
    "Trailer": o([
        { json: "youtube_id", js: "youtube_id", typ: u(null, "") },
        { json: "url", js: "url", typ: u(null, "") },
        { json: "embed_url", js: "embed_url", typ: u(null, "") },
        { json: "images", js: "images", typ: r("Images") },
    ], false),
    "Images": o([
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "small_image_url", js: "small_image_url", typ: u(null, "") },
        { json: "medium_image_url", js: "medium_image_url", typ: u(null, "") },
        { json: "large_image_url", js: "large_image_url", typ: u(null, "") },
        { json: "maximum_image_url", js: "maximum_image_url", typ: u(null, "") },
    ], false),
    "Links": o([
        { json: "first", js: "first", typ: "" },
        { json: "last", js: "last", typ: "" },
        { json: "prev", js: "prev", typ: null },
        { json: "next", js: "next", typ: "" },
    ], false),
    "Meta": o([
        { json: "current_page", js: "current_page", typ: 0 },
        { json: "from", js: "from", typ: 0 },
        { json: "last_page", js: "last_page", typ: 0 },
        { json: "links", js: "links", typ: a(r("Link")) },
        { json: "path", js: "path", typ: "" },
        { json: "per_page", js: "per_page", typ: 0 },
        { json: "to", js: "to", typ: 0 },
        { json: "total", js: "total", typ: 0 },
    ], false),
    "Link": o([
        { json: "url", js: "url", typ: u(null, "") },
        { json: "label", js: "label", typ: "" },
        { json: "active", js: "active", typ: true },
    ], false),
    "Pagination": o([
        { json: "last_visible_page", js: "last_visible_page", typ: 0 },
        { json: "has_next_page", js: "has_next_page", typ: true },
        { json: "current_page", js: "current_page", typ: 0 },
        { json: "items", js: "items", typ: r("Items") },
    ], false),
    "Items": o([
        { json: "count", js: "count", typ: 0 },
        { json: "total", js: "total", typ: 0 },
        { json: "per_page", js: "per_page", typ: 0 },
    ], false),
    "Timezone": [
        "Asia/Tokyo",
    ],
    "DemographicType": [
        "anime",
    ],
    "Rating": [
        "PG-13 - Teens 13 or older",
        "PG - Children",
        "R - 17+ (violence & profanity)",
        "R+ - Mild Nudity",
    ],
    "Season": [
        "fall",
        "spring",
        "summer",
    ],
    "Source": [
        "Light novel",
        "Manga",
        "Original",
    ],
    "Status": [
        "Currently Airing",
        "Finished Airing",
    ],
    "TitleType": [
        "Default",
        "English",
        "French",
        "German",
        "Japanese",
        "Spanish",
        "Synonym",
    ],
    "DatumType": [
        "Movie",
        "TV",
    ],
};
