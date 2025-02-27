import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    console.log('token.js verifyToken::'+token);

    if (!token) {
        return res.status(403).json({ message: "접근이 거부되었습니다. 로그인해주세요." });
    }

    jwt.verify(token.replace("Bearer ", ""), "SECRET_KEY", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
        }
        req.user = decoded;
        console.log('token.js req.user.id:::'+req.user.id);
        console.log('token.js req.user.email:::'+req.user.email);
        next();
    });
};