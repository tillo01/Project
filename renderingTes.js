/** @format */

function authMiddleware(req, res, next) {
   if (!req.headers.authorization) {
      return res.status(401).json({ error: "Unauthorized" });
   }
   next();
}

module.exports = authMiddleware;

const authMiddleware = require("../../src/middleware/auth");

test("denies access without authorization header", () => {
   const req = { headers: {} };
   const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
   };
   const next = jest.fn();

   authMiddleware(req, res, next);

   expect(res.status).toHaveBeenCalledWith(401);
   expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
   expect(next).not.toHaveBeenCalled();
});
