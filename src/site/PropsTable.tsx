import type { PropDoc } from '../registry/types';

export default function PropsTable({ props }: { props: PropDoc[] }) {
  if (props.length === 0) return <p className="muted">This component has no props.</p>;

  return (
    <div className="props">
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <td><code>{p.name}</code></td>
              <td><code className="props__type">{p.type}</code></td>
              <td><code>{p.default}</code></td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
