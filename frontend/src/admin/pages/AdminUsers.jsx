export default function AdminUsers() {
  const users = [
    ["Ahmed", "Admin"],
    ["Mona", "Doctor"],
    ["Omar", "Advisor"],
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black text-slate-950">Users</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(([name, role]) => (
              <tr key={name} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {name}
                </td>
                <td className="px-4 py-3 text-slate-600">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
