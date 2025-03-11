import { html } from "rhu/html.js";
import { signal } from "rhu/signal.js";
import { Style } from "rhu/style.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    font-family: roboto;
    font-size: 20px;

	margin: auto;
	max-width: 500px;

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: #fff;

    overflow: hidden;
    `;
    const body = css.class`
    flex: 1;
    `;

    const title = css.class`
    padding: 5px;
	font-size: 35px;
    `;

    const list = css.class`
	width: 100%;
    `;
    
    const item = css.class`
    width: 100%;
    padding: 5px;
	height: 45px;
	position: relative;
    `;

    const inputwrapper = css.class`
    flex: 1;
	height: 100%;
	align-items: center;
	justify-content: center;
    `;

    const input = css.class`
    width: 80%;
    `;

    const result = css.class`
    display: flex;
	flex-direction: column;
    margin-top: 10px;
    padding: 5px;
	gap: 10px; 
	align-items: center;
	justify-content: center;
    `;

    const good = css.class`
    background-color: #5fe625;
    color: #fff;
    `;
    const warn = css.class`
    background-color: #ff8324;
    color: #fff;
    `;
    const bad = css.class`
    background-color: #e30538;
    color: #fff;
    `;

    return {
        title,
        wrapper,
        body,
        list,
        item,
        inputwrapper,
        input,
        result,

        good,
        warn,
        bad
    };
});

const App = () => {
    const result = signal(0);
	const description = signal("");

    const variables = ["Respiratory rate", "Tidal volume", "PEEP", "Driving pressure", "Flow rate", "BMI"];
	const units = {
		"Respiratory rate": "breaths/minute",
		"Tidal volume": "L",
		"PEEP": "cmH2O",
		"Driving pressure": "cmH2O",
		"Flow rate": "L/min",
		"BMI": "kg/m^2"
	};

    const dom = html`
    <div class="${style.wrapper}">
        <h1 class="${style.title}">Mechanical Power</h1>
		<div style="padding: 0 5px;"> description here </div>
        <div m-id="body" class="${style.body}">
            <table m-id="table" class="${style.list}">
            </table>
            <div m-id="resultbox" class="${style.result}">
				<span>${result} J/min</span>
				<span>${description}</span>
            </div>
        </div>
    </div>
    `;
    html(dom).box();

    variables.map((v) => {
        const item = html`
        <tr class="${style.item}">
            <td style="padding: 0 10px; width: 40%;">${v}</td>
            <td class="${style.inputwrapper}">
                <input
					class="${style.input}"
					m-id="${v}"
					type="number"
					value="0"
				/>
				</td>
				<td>
                <span>${units[v] ? units[v] : "unit"}</span>
            </td>
        </tr>
        `;
        dom[v] = item[v];
        dom.table.append(...item);
    });
 
    result.on((v) => {
        dom.resultbox.classList.remove(`${style.good}`);
        dom.resultbox.classList.remove(`${style.bad}`);
        dom.resultbox.classList.remove(`${style.warn}`);
        
        if (v < 20) {
            dom.resultbox.classList.add(`${style.good}`);
			description("description 1 here");
        } else if (v < 30) {
            dom.resultbox.classList.add(`${style.warn}`);
			description("description 2 here");
        } else {
            dom.resultbox.classList.add(`${style.bad}`);
			description("description 3 here");
        }
    })

    const $ = {};
    const update = () => {
        for (let v of variables) {
            try {
                $[v] = parseInt(dom[v].value);
            } catch {
                $[v] = 0;
            }

            if (isNaN($[v])) {
                $[v] = 0;
            }
        }
        result($["Respiratory rate"] + $["Tidal volume"] + $["PEEP"] + $["Driving pressure"] + $["Flow rate"] + $["BMI"]);
    };
/*"Respiratory rate", "Tidal volume", "PEEP", "Driving pressure", "Flow rate", "BMI"*/
    
    for (let v of variables) {
        dom[v].addEventListener("keyup", update);
        dom[v].addEventListener("change", update);
    }
    
    return dom;
};

export const app = App();

// Load app
const __load__ = () => {
    document.body.replaceChildren(...app);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}