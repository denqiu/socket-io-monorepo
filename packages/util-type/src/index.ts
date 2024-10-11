/**
 * Convert index positions of array into union.
 * @example
 * type Arr = ['a', 'b', 'c'];
 * type E = 'a' | 'b' | 'c';
 * E === Union<Arr>
 */
type Union<Arr extends readonly any[]> = Arr[number];

type SampleProps = {
    /**
     * Id
     */
    id: string;
    /**
     * Label
     */
    label: string;
    /**
     * Items
     */
    items: any[];
    /**
     * @param item Item
     */
    func: (item: any) => void;
};

class HowToExpandProps {
    wrongWay(sample: { [Props in keyof SampleProps]: SampleProps[Props] }) {
        console.warn("Properties are inlined correctly but they are not inferred. Hover over this function and autocomplete displays { [Props in keyof SampleProps]: SampleProps[Props] } syntax.");
    }

    correctWay<S extends SampleProps>(sample: { [Props in keyof S]: S[Props] }) {
        console.log("Properties are inlined correctly and are inferred. Hover over this function and autocomplete displays { id: string, label: string, items: any[], func: (item: any) => void } syntax.");
    }
}

export {
    type Union,
    type SampleProps,
    HowToExpandProps
};