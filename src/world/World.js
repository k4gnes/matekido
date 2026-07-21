export class World {

    constructor({ id, name, icon, description, requiredStars }) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.requiredStars = requiredStars;
    }

    isUnlocked(stars) {
        return stars >= this.requiredStars;
    }

    starsNeeded(stars) {
        return Math.max(0, this.requiredStars - stars);
    }

}
