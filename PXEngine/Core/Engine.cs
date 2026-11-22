using System.Numerics;

namespace PXEngine.Core;

// Brique de base : tout ce qu'on ajoute à un Actor
public abstract class Component
{
    public Actor Owner { get; internal set; } = null!;
    public virtual void Start() { }
    public virtual void Update(float deltaTime) { }
}

// Position, rotation et taille d'un Actor
public class TransformComponent : Component
{
    public Vector3 Position = Vector3.Zero;
    public Vector3 Rotation = Vector3.Zero;
    public Vector3 Scale = Vector3.One;
}

// Forme 3D visible : "box", "sphere" ou "ground"
public class MeshComponent : Component
{
    public string Shape = "box";
    public string Color = "#3399ff";
}

// Exemple de comportement : fait tourner l'Actor pendant le jeu
public class RotatorComponent : Component
{
    public Vector3 Speed = new(0.5f, 1f, 0f);

    public override void Update(float deltaTime)
    {
        Owner.Transform.Rotation += Speed * deltaTime;
    }
}

// Un objet de la scène (comme AActor dans Unreal)
public class Actor
{
    private static int _nextId = 1;
    private readonly List<Component> _components = new();

    public int Id { get; } = _nextId++;
    public string Name { get; set; }
    public TransformComponent Transform { get; }

    public Actor(string name)
    {
        Name = name;
        Transform = AddComponent(new TransformComponent());
    }

    public T AddComponent<T>(T component) where T : Component
    {
        component.Owner = this;
        _components.Add(component);
        return component;
    }

    public T? GetComponent<T>() where T : Component
        => _components.OfType<T>().FirstOrDefault();

    public void Start() { foreach (var c in _components) c.Start(); }
    public void Update(float dt) { foreach (var c in _components) c.Update(dt); }
}

// Le monde qui contient tous les Actors
public class Scene
{
    public List<Actor> Actors { get; } = new();

    public Actor Spawn(string name)
    {
        var actor = new Actor(name);
        Actors.Add(actor);
        return actor;
    }

    public void Destroy(Actor actor) => Actors.Remove(actor);

    public void Start() { foreach (var a in Actors) a.Start(); }
    public void Update(float dt) { foreach (var a in Actors) a.Update(dt); }
}
