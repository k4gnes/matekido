export class World {

    constructor({ id, name, icon, description, requiredStars, tagline }) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.requiredStars = requiredStars;
        this.tagline = tagline;
    }

    isUnlocked(stars) {
        return stars >= this.requiredStars;
    }

    starsNeeded(stars) {
        return Math.max(0, this.requiredStars - stars);
    }

}
