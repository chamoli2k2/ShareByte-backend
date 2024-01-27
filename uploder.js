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

        // TODO : remove it?
        mkdirSync('./dump/uploads/' + dir_name, { recursive: true, });

        // if file is not image then we throw error
        if (file.mimetype.split('/')[0] != 'image') {
            const file_type = file.mimetype.split('/')[1].split('-').pop();
            return cb("Cant upload File of type " + file_type, null);
        }
        return cb(null, file_path);
    }
});

export const uploder = multer({
    storage,
});
