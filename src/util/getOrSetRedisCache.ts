import {redisClient} from "../index";

const getOrSetRedisCache = async (key: string, ttl: number, cb: any) => {
    const reply = await redisClient.get(key).catch((err) => {
        return err
    })
    if (reply) {
        return JSON.parse(reply);
    } else {
        const response = await cb();
        await redisClient.setEx(key, ttl, JSON.stringify(response))
        return response;
    }
}

export default getOrSetRedisCache