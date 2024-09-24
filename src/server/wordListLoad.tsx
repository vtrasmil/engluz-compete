import {promises as fs} from "fs";

export const dictionaryFilePath = `/public/CSW2019.txt`;
export let dictionary: Set<string>;
export const dictionaryKey = 'dict'

export async function loadDictIntoMem() {
    try {
        const data = await fs.readFile(process.cwd() + dictionaryFilePath, {encoding: 'utf8'});
        const array = data.split('\r\n')
        dictionary = new Set(array);
    } catch (err) {
        console.error(err);
    }
}

void loadDictIntoMem(); // TODO: called on every function call?