import { type ChangeEvent, type KeyboardEvent, useState } from "react";

export type SkillTagInputProps = {
  label: string;
  tags: string[];
  onChange: (nextTags: string[]) => void;
  placeholder?: string;
};

function SkillTagInput({
  label,
  tags,
  onChange,
  placeholder = "Type a skill and press Enter",
}: SkillTagInputProps) {
  const [input, setInput] = useState<string>("");

  const addTag = (value: string) => {
    const cleanValue = value.trim();
    if (!cleanValue) {
      return;
    }

    const duplicate = tags.some((tag: string) => tag.toLowerCase() === cleanValue.toLowerCase());
    if (!duplicate) {
      onChange([...tags, cleanValue]);
    }
    setInput("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag: string) => tag !== tagToRemove));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(input);
    }
  };

  const onBlur = () => {
    addTag(input);
  };

  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className="tag-input-wrap">
        <div className="tags-row">
          {tags.map((tag: string) => (
            <span className="skill-tag" key={tag}>
              {tag}
              <button type="button" className="tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                x
              </button>
            </span>
          ))}
        </div>
        <input
          className="tag-input"
          value={input}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default SkillTagInput;
