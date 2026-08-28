import { Descent } from '@/components/Descent'
import { DepartmentTable } from '@/components/DepartmentTable'
import { Panel, Stats } from '@/components/Panel'
import {
  BORDERS_TOTAL_KM,
  ECONOMY,
  HERITAGE,
  IDENTITY,
  PEOPLE,
  NEIGHBOURS,
  PEOPLES,
  RELIGIONS,
  SOURCES,
  TERRITORY,
} from '@/data/benin'
import { GEO } from '@/lib/geo'

function Bars({
  title,
  note,
  items,
}: {
  title: string
  note: string
  items: { name: string; share: number }[]
}) {
  // La largeur est la part réelle de la population : les barres ne remplissent
  // jamais la piste, et le total ne fait volontairement pas 100 %.
  return (
    <div className="bars">
      <h3 className="bars__title">{title}</h3>
      <ul>
        {items.map((i) => (
          <li key={i.name}>
            <span className="bars__name">{i.name}</span>
            <span className="bars__track">
              <span className="bars__fill" style={{ width: `${i.share}%` }} />
            </span>
            <span className="bars__value">{share.format(i.share)} %</span>
          </li>
        ))}
      </ul>
      <p className="bars__note">{note}</p>
    </div>
  )
}

const points = (rings: number[][]) => rings.reduce((n, r) => n + r.length / 2, 0)

const nf = new Intl.NumberFormat('fr-FR')

const share = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export default function Page() {
  return (
    <Descent>
      <Panel
        id="orbite"
        title={
          <>
            République
            <br />
            du Bénin
          </>
        }
        lede="Une bande de terre de 672 kilomètres, du fleuve Niger à l’océan Atlantique. Cette page descend jusqu’à elle. Elle ne montre que des chiffres datés, avec leur source."
      >
        <p className="hero__hint">
          <span className="hero__rule" aria-hidden />
          Faites défiler pour descendre
        </p>
      </Panel>

      <Panel
        id="territoire"
        title="Un pays posé à la verticale"
        lede="Le Bénin est bien plus haut que large. Cette forme commande le reste : le climat passe de l’équatorial au sud au soudanien au nord, et les villes se concentrent sur les 121 kilomètres de côte."
      >
        <Stats items={TERRITORY} />
      </Panel>

      <Panel
        id="voisins"
        title="Quatre voisins, une seule façade maritime"
        lede={`${nf.format(BORDERS_TOTAL_KM)} kilomètres de frontières terrestres. Au sud, le golfe de Guinée : le seul accès direct à la mer, et l’entrée du port de Cotonou.`}
      >
        <ul className="neighbours">
          {NEIGHBOURS.map((n) => (
            <li key={n.name}>
              <p className="neighbours__side">{n.bearing}</p>
              <p className="neighbours__name">
                {n.name}
                <span className="neighbours__km">{nf.format(n.km)} km</span>
              </p>
              <p className="neighbours__detail">{n.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        id="population"
        title="14,8 millions d’habitants"
        lede="Le pays en comptait 2,1 millions en 1961 et 10 millions au recensement de 2013. Quatre habitants sur dix ont aujourd’hui moins de quinze ans."
      >
        <Stats items={PEOPLE} />
      </Panel>

      <Panel
        id="appartenances"
        title="Ce que les habitants déclarent"
        lede="Les appartenances religieuses viennent du recensement de 2013. La ventilation par groupe de population vient de celui de 2002, le dernier à l’avoir publiée."
      >
        <div className="split">
          <Bars
            title="Appartenance religieuse"
            note="En % de la population. Les autres communautés pèsent chacune moins de 5 %."
            items={RELIGIONS}
          />
          <Bars
            title="Groupes de population"
            note="En % de la population, populations apparentées incluses."
            items={PEOPLES}
          />
        </div>
      </Panel>

      <Panel
        id="departements"
        title="Douze départements, 77 communes"
        lede="Le découpage actuel date de 1999. Les couleurs suivent la densité de population : de 33 habitants au kilomètre carré dans l’Alibori à 8 593 dans le Littoral, qui tient en 79 km²."
      >
        <DepartmentTable />
      </Panel>

      <Panel
        id="economie"
        title="L’État et ce qu’il pèse"
        lede="Le franc CFA ouest-africain est arrimé à l’euro à parité fixe : 655,957 XOF pour 1 euro."
      >
        <Stats items={ECONOMY} />
        <dl className="fiche">
          <div>
            <dt>Capitale</dt>
            <dd>{IDENTITY.capital}</dd>
          </div>
          <div>
            <dt>Siège du gouvernement</dt>
            <dd>{IDENTITY.seat}</dd>
          </div>
          <div>
            <dt>Indépendance</dt>
            <dd>{IDENTITY.independence}</dd>
          </div>
          <div>
            <dt>Ancien nom</dt>
            <dd>{IDENTITY.former}</dd>
          </div>
          <div>
            <dt>Monnaie</dt>
            <dd>{IDENTITY.currency}</dd>
          </div>
        </dl>
      </Panel>

      <Panel
        id="patrimoine"
        title="Ce qui se transmet"
        lede="Deux biens inscrits au patrimoine mondial, une cité bâtie sur l’eau, et un port d’où sont partis des centaines de milliers de captifs."
      >
        <ul className="heritage">
          {HERITAGE.map((h) => (
            <li key={h.name}>
              <p className="heritage__where">
                {h.where}
                {h.year ? <span className="heritage__year">{h.year}</span> : null}
              </p>
              <h3 className="heritage__name">{h.name}</h3>
              <p className="heritage__detail">{h.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        id="sources"
        title="D’où viennent ces chiffres"
        lede="Chaque valeur porte son millésime. Les frontières sont des données ouvertes, pas des tracés approximés à la main."
      >
        <ul className="sources">
          {Object.values(SOURCES).map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer noopener">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="colophon">
          Le contour du Bénin est tracé sur {nf.format(points(GEO.benin))} points, les douze
          départements sur {nf.format(points(GEO.departments.flatMap((d) => d.rings)))}. Le globe est
          calculé — aucune texture, aucune image satellite. Rendu avec React Three Fiber et Three.js.
          Bande sonore : « Funk & Breakbeat », alexguz.
        </p>
      </Panel>
    </Descent>
  )
}
