import multer from "multer";
import { mkdirSync } from "node:fs";

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, './dump/uploads/');
    },

    filename(req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const dir_name = file.fieldname + 's/';
        const file_path = dir_name + uniquePrefix + '_' + file.originalname;
        mkdirSync(dir_name, { recursive: true, });
        cb(null, file_path);
    }
});

export const uploder = multer({
    storage,
});