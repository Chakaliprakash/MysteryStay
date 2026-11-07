package com.mysterystay.hotel.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "amenities")
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "icon_key", length = 50)
    private String iconKey;

    @Column(length = 255)
    private String description;

    @Column(name = "is_mystery_clue", nullable = false)
    private boolean mysteryClue = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Amenity() {}

    public Amenity(String name, String iconKey, String description, boolean mysteryClue) {
        this.name = name;
        this.iconKey = iconKey;
        this.description = description;
        this.mysteryClue = mysteryClue;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIconKey() {
        return iconKey;
    }

    public void setIconKey(String iconKey) {
        this.iconKey = iconKey;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isMysteryClue() {
        return mysteryClue;
    }

    public void setMysteryClue(boolean mysteryClue) {
        this.mysteryClue = mysteryClue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Amenity amenity = (Amenity) o;
        return Objects.equals(name, amenity.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
