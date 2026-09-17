import { CorporateHero } from "../components/company/CorporateHero";
import { Link } from "react-router-dom";
import { ShieldIcon, TruckIcon, HeadsetIcon } from "../components/ui/Icons";

type Topic = "delivery" | "returns" | "warranty";
const policies = {
  delivery: {
    title: "Delivery information",
    intro: "Plan your delivery, check your order, and know what to do when your electronics arrive.",
    icon: TruckIcon,
    sections: [
      ["Delivery location and cost", "Enter your full delivery address at checkout, including your district, sector, and a useful landmark. Your shipping charge appears in the order summary before you place the order. Contact support to confirm delivery availability for your location."],
      ["When to expect your order", "Delivery timing depends on your location and product availability. Contact support with your order number for an estimated delivery date or help with a delay."],
      ["Keep your delivery details accurate", "Use a phone number where you can be reached. If your address or availability changes after ordering, contact support as soon as possible with your order number and the updated details."],
      ["Check your items on arrival", "Check that the package and products match your order. Keep your receipt and packaging. If an item is missing, incorrect, or damaged, take photos and contact support promptly."],
    ],
    faqs: [
      ["Where can I check my order?", "Sign in and open My orders to see the current status and order details."],
      ["Can I change my address after ordering?", "Contact support promptly. Whether a change is possible depends on how far your order has progressed."],
    ],
  },
  returns: {
    title: "Returns & exchanges",
    intro: "Received the wrong item or having a problem? Gather your order details and let us help you with the next step.",
    icon: HeadsetIcon,
    sections: [
      ["Start with your order details", "Contact support with your order number, product name, and reason for your request. Include photos of any damage or incorrect item and describe when you noticed the issue."],
      ["Confirm eligibility before sending an item", "Return windows and eligibility can depend on the product and the terms supplied with your purchase. Ask support to confirm the applicable conditions and return instructions before sending anything back."],
      ["Prepare the product", "Keep the packaging, accessories, and proof of purchase available. Before handing over a device, back up your data and ask support how to handle personal accounts and device locks."],
      ["Review and next steps", "Support will advise on inspection and the available resolution for your request, including whether an exchange, repair, or refund applies. Confirm any transport costs and expected processing time with support."],
    ],
    faqs: [
      ["Can I return an item because I changed my mind?", "Contact support to check whether your product is eligible and which conditions apply."],
      ["What if my product arrived damaged?", "Keep the packaging, take photos of the product and package, and contact support promptly with your order number."],
    ],
  },
  warranty: {
    title: "Warranty support",
    intro: "Find the warranty information for your product and get guidance when something stops working.",
    icon: ShieldIcon,
    sections: [
      ["Check your product’s coverage", "Warranty duration and coverage vary by product, brand, and supplier. Refer to the warranty documents provided with your item or ask support to confirm coverage before purchasing."],
      ["Keep your proof of purchase", "Save your receipt, order number, and any warranty card. The product model and serial number, where available, help support identify your device and its applicable warranty terms."],
      ["Describe the fault", "Contact support with the product details, a clear description of the problem, and any error messages or photos. Include when the issue started and the troubleshooting steps you have already tried."],
      ["Arrange assessment", "Support will explain the assessment process and applicable warranty conditions. Ask for instructions before opening the device or arranging repairs. Back up your data before handing over a device for service."],
    ],
    faqs: [
      ["Does every product have the same warranty?", "No. Confirm the warranty duration and coverage for the specific product using its supplied documents or by contacting support."],
      ["Is accidental damage covered?", "Coverage depends on the warranty terms supplied with your product. Ask support to check the terms for your device and issue."],
    ],
  },
} satisfies Record<Topic, { title: string; intro: string; icon: typeof TruckIcon; sections: string[][]; faqs: string[][] }>;

export function SupportPolicyPage({ topic }: { topic: Topic }) {
  const policy = policies[topic];
  const Icon = policy.icon;
  const email = `mailto:hello@buzimabooster.rw?subject=${encodeURIComponent(`${policy.title} enquiry`)}&body=${encodeURIComponent("Order number (if available):\nProduct:\nMy question:\n")}`;

  return (
    <main className="bg-slate-50">
      <CorporateHero eyebrow="Customer support" title={policy.title} description={policy.intro}><span className="grid size-12 place-items-center rounded-xl border border-slate-700 text-sky-400"><Icon aria-hidden="true" className="size-6" /></span></CorporateHero>
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
        <nav aria-label="Support topics" className="mt-8 flex flex-wrap gap-3">
          {(Object.keys(policies) as Topic[]).map((item) => <Link aria-current={item === topic ? "page" : undefined} className={`rounded-xl px-5 py-3 text-sm font-bold transition ${item === topic ? "bg-sky-500 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600"}`} key={item} to={`/${item}`}>{policies[item].title}</Link>)}
        </nav>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="grid gap-5 sm:grid-cols-2">{policy.sections.map(([title, text], index) => <section className="rounded-2xl border border-slate-200 bg-white p-6" key={title}><span className="text-xs font-black text-orange-500">0{index + 1}</span><h2 className="mt-3 text-lg font-bold text-slate-950">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></section>)}</div>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Common questions</h2><div className="mt-4 divide-y divide-slate-100">{policy.faqs.map(([question, answer]) => <details className="group py-4" key={question}><summary className="cursor-pointer text-sm font-bold text-slate-800 focus-visible:outline-sky-500">{question}</summary><p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></section>
          </div>
          <aside className="rounded-2xl bg-slate-950 p-7 text-white"><h2 className="text-xl font-black">Need help with an order?</h2><p className="mt-3 text-sm leading-7 text-slate-300">Have your order number and product details ready so we can help with your request.</p><a className="mt-6 block rounded-xl bg-sky-500 px-5 py-3 text-center text-sm font-bold hover:bg-sky-600" href={email}>Email support</a><Link className="mt-3 block rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-bold hover:bg-slate-800" to="/account/orders">My orders</Link><p className="mt-5 break-all text-xs text-slate-400">hello@buzimabooster.rw</p></aside>
        </div>
      </div>
    </main>
  );
}
