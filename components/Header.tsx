import {
  HandCoins,
  House,
  Users,
  ChartColumn,
  Settings,
  CircleUserRound,
} from "lucide-react";


export default function Header() {
    

    const navItems = [
    {
        name: "Home",
        icon: House,
    },
    {
        name: "Groups",
        icon: Users,
    },
    {
        name: "Activity",
        icon: ChartColumn,
    },
    {
        name: "Settings",
        icon: Settings,
    },
    ];

    return (

<header className="w-full bg-hk-background shadow border-b border-[#b2e0d4]">

<div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">

<div>

<h1 className="flex items-center gap-2 text-3xl font-bold text-hk-primary">
  <HandCoins size={30} />
  Hating Kapatid
</h1>

<p className="text-hk-secondary mt-1">
ambagan made easy.
</p>

</div>

<div className="flex items-center gap-2 font-medium text-hk-primary">
  <CircleUserRound size={22} />
  Guest
</div>

</div>

<nav className="max-w-6xl mx-auto px-8 py-3 flex gap-10">

  {navItems.map((item) => {

    const Icon = item.icon;

    return (
      <button
        key={item.name}
        className="
          flex
          items-center
          gap-2
          font-medium
          text-hk-primary
          hover:text-hk-secondary
          transition-colors
        "
      >
        <Icon size={18} />
        {item.name}
      </button>
    );

  })}

</nav>


</header>

    );

}