import { BootstrapperBase } from "@core/bootstrapperBase";
import AnagramGame from "./anagram/bootstrapper";
import BugSequenceGame from "./bugsequence/bootstrapper"
import DoubleGame from "./double/bootstrapper";
import ColorsGame from "./colors/bootstrapper";
import MemoGame from "./memo/bootstrapper";

export const GamesList: BootstrapperBase[] = [
    new AnagramGame(),
    new BugSequenceGame(),
    new DoubleGame(),
    new ColorsGame(),
    new MemoGame()
]